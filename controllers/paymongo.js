/**
 * paymongo.js controller
 *
 * @description: A set of functions called "actions" of the `paymongo` plugin.
 */

const unparsed = require('koa-body/unparsed');
const {
	PAYMENT_INTENT_STATUSES,
	PAYMONGO_PAYMENT_STATUSES,
} = require('../constants');

const pluginPkg = require('../package.json');

const { name: pluginName } = pluginPkg.strapi;

module.exports = {
	getSettings: async (ctx) => {
		const pluginSettingsStore = await strapi.store({
			environment: '',
			type: 'plugin',
			name: 'paymongo',
			key: 'settings',
		});

		const settings = await pluginSettingsStore.get();

		ctx.send(settings);
	},

	setSettings: async (ctx) => {
		const pluginSettingsStore = strapi.store({
			environment: '',
			type: 'plugin',
			name: 'paymongo',
			key: 'settings',
		});

		const settings = await pluginSettingsStore.get();

		await pluginSettingsStore.set({
			value: { ...settings, ...ctx.request.body },
		});

		ctx.send({
			ok: true,
		});
	},

	createPaymentIntent: async (ctx, next) => {
		const {
			amount,
			statement_descriptor: statementDescriptor,
		} = ctx.request.body;

		if (!amount) {
			ctx.status = 400;
			ctx.body = {
				errors: [
					{
						detail: 'Invalid amount',
					},
				],
			};
			await next();
			return;
		}

		const newPayment = await strapi
			.query('paymongo-payments', pluginName)
			.create({ type: 'cc' });

		const payload = {
			amount,
			paymentId: newPayment.paymentId,
			statement_descriptor: statementDescriptor,
		};

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.createPaymentIntent(
				payload,
			);
			const {
				data: { id: paymentIntentId },
			} = result;

			strapi
				.query('paymongo-payments', pluginName)
				.update({ id: newPayment.id }, { paymentIntentId });

			ctx.send(result);
		} catch (err) {
			const { errors } = err.response.body;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},

	attachPaymentIntent: async (ctx, next) => {
		const { intentId, methodId } = ctx.request.body;

		if (!methodId || !intentId) {
			ctx.status = 400;
			ctx.body = {
				errors: [
					{
						detail: 'Invalid request',
					},
				],
			};
			return next();
		}

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.attachPaymentIntent(
				{ intentId, methodId },
			);
			const {
				data: { attributes },
			} = result;
			const { status } = attributes;

			if (status === 'succeeded') {
				strapi.query('paymongo-payments', pluginName).update(
					{ paymentIntentId: intentId },
					{
						status: 'success',
						rawResponse: JSON.stringify(result),
					},
				);
			}

			return ctx.send(result);
		} catch (err) {
			const { errors } = err.response.body;

			ctx.status = err.response.status;
			ctx.body = { errors };

			return next();
		}
	},

	process3dsRedirect: async (ctx, next) => {
		const { pid, vt } = ctx.query;

		if (!pid || !vt) {
			ctx.status = 400;
			ctx.body = {
				errors: [
					{
						detail: 'Invalid request',
					},
				],
			};
			return next();
		}

		const payment = await strapi
			.query('paymongo-payments', pluginName)
			.findOne({ paymentId: pid, verificationToken: vt });

		if (!payment || Object.keys(payment).length === 0) {
			ctx.status = 400;
			ctx.body = {
				errors: [
					{
						detail: 'Invalid request',
					},
				],
			};
			return next();
		}

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.retrievePaymentIntent(
				payment.paymentIntentId,
			);
			const {
				data: { attributes },
			} = result;
			const { status } = attributes;

			const pluginStore = strapi.store({
				environment: '',
				type: 'plugin',
				name: pluginName,
				key: 'settings',
			});

			const {
				checkout_failure_url: checkoutFailureUrl,
				checkout_success_url: checkoutSuccessUrl,
			} = await pluginStore.get();

			if (status === PAYMENT_INTENT_STATUSES.SUCCEEDED) {
				await strapi.query('paymongo-payments', pluginName).update(
					{ id: payment.id },
					{
						status: 'success',
						rawResponse: result,
					},
				);

				return ctx.redirect(checkoutSuccessUrl);
			}

			if (status === PAYMENT_INTENT_STATUSES.AWAITING_PAYMENT_METHOD) {
				await strapi
					.query('paymongo-payments', pluginName)
					.update(
						{ id: payment.id },
						{ status: 'fail', rawResponse: result },
					);

				return ctx.redirect(checkoutFailureUrl);
			}

			if (status === PAYMENT_INTENT_STATUSES.PROCESSING) {
				// Need CRON job or schedule job for this OR wait for the webhook for payments
				return next();
			}

			if (status === PAYMENT_INTENT_STATUSES.AWAITING_NEXT_ACTION) {
				// This will probably never happen, but in case that it did, do something
				return next();
			}

			return next();
		} catch (err) {
			const { errors } = err.response.body;

			ctx.status = err.response.status;
			ctx.body = { errors };

			return next();
		}
	},

	createSource: async (ctx, next) => {
		const { amount, billing, type } = ctx.request.body;
		const validTypes = ['gcash', 'grab_pay'];

		if (!validTypes.includes(type)) {
			ctx.status = 400;
			ctx.body = {
				errors: [
					{
						detail: 'Invalid payment type',
					},
				],
			};

			await next();
			return;
		}

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.createSource(
				amount,
				type,
				billing,
			);

			const {
				data: { id: sourceId },
			} = result;

			await strapi
				.query('paymongo-payments', pluginName)
				.create({ type, sourceId });

			ctx.send(result);
		} catch (err) {
			const { errors } = err.response.body;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},

	handleWebhook: async (ctx, next) => {
		try {
			const validRequest = await strapi.plugins.paymongo.services.paymongo.verifyWebhook(
				ctx.request.headers,
				ctx.request.body[unparsed],
			);

			if (!validRequest) throw new Error('Invalid webhook request');
		} catch (err) {
			/** Do something if not valid webhook request */
			return;
		}

		/** Always respond with 200 to avoid webhook request to be resent */
		ctx.status = 200;
		ctx.send();

		const {
			data: { attributes, type },
		} = ctx.request.body;
		const {
			data: {
				attributes: { amount, status, type: sourceType },
				id: sourceId,
			},
			type: eventType,
		} = attributes;

		const validEventTypes = ['source.chargeable'];

		/** If not a valid event type, ignore */
		if (type === 'event' && !validEventTypes.includes(eventType)) return;

		if (status === 'chargeable') {
			/** Query all payments for now, Strapi can't filter components */
			const payment = await strapi
				.query('paymongo-payments', pluginName)
				.findOne({
					_limit: -1,
					type: sourceType,
					sourceId,
				});

			if (!payment || Object.keys(payment).length === 0) {
				return;
			}

			const { id, paymentId } = payment;

			try {
				const result = await strapi.plugins.paymongo.services.paymongo.createPayment(
					amount,
					sourceId,
					paymentId,
				);
				const {
					data: {
						attributes: { status: paymongoPaymentStatus },
					},
				} = result;

				let paymentStatus;

				switch (paymongoPaymentStatus) {
					case PAYMONGO_PAYMENT_STATUSES.PAID: {
						paymentStatus = 'success';
						break;
					}
					case PAYMONGO_PAYMENT_STATUSES.FAILED: {
						paymentStatus = 'fail';
						break;
					}
					case PAYMONGO_PAYMENT_STATUSES.PENDING:
					default: {
						paymentStatus = 'pending';
					}
				}

				await strapi.query('paymongo-payments', pluginName).update(
					{ id },
					{
						rawResponse: result,
						status: paymentStatus,
					},
				);
			} catch (err) {
				await next();
			}
		}
	},
};

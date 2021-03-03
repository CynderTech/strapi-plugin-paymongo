/**
 * paymongo.js controller
 *
 * @description: A set of functions called "actions" of the `paymongo` plugin.
 */

const unparsed = require('koa-body/unparsed');

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

		await pluginSettingsStore.set({ value: { ...settings, ...ctx.request.body } });

		ctx.send({
			ok: true,
		});
	},

	createPaymentIntent: async (ctx, next) => {
		const { amount } = ctx.request.body;

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

    const newPayment = await strapi.query('paymongo-payments', pluginName).create({});

    const payload = { amount, paymentId: newPayment.id };

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.createPaymentIntent(payload);
      const { data: { id: paymentIntentId } } = result;

      strapi.query('paymongo-payments', pluginName).update({ id: newPayment.id }, { paymentIntentId });

			ctx.send(result);
		} catch (err) {
			const { errors } = err.response.data;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},

  attachPaymentIntent: async (ctx, next) => {
    const { methodId, intentId } = ctx.request.body;

    try {
      const result = await strapi.plugins.paymongo.services.paymongo.attachPaymentIntent({ intentId, methodId });
      ctx.send(result);
    } catch (err) {
      const { errors } = err.response.data;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
    }
  },

	createSource: async (ctx, next) => {
		const { amount, platform, type } = ctx.request.body;
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
        platform,
			);
			ctx.send(result);
		} catch (err) {
			const { errors } = err.response.data;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},

	handleWebhook: async (ctx) => {
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
			const payments = await strapi.query('payment').find({
        _limit: -1,
				paymentType: sourceType,
			});

			const payment = payments.find(({ paymentOption: { eWallet } }) => {
				return eWallet.type === sourceType && eWallet.sourceId === sourceId;
			});

			if (!payment) return;

			const {
				id,
				paymentId,
				paymentOption: { eWallet },
			} = payment;

			const {
				data: { id: paymongoPaymentId },
			} = await strapi.plugins.paymongo.services.paymongo.createPayment(
				amount,
				sourceId,
				paymentId,
			);

			await strapi.query('payment').update(
				{ id },
				{
					paymentOption: { eWallet: { ...eWallet, reference: paymongoPaymentId } },
					status: 'paid',
				},
			);
		}
	},
};

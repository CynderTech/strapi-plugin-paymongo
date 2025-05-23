/**
 *  PayMongo controller
 */

import unparsed from 'koa-body/unparsed';

import { VALID_EVENT_TYPES, VALID_SOURCE_TYPES } from '../constants';
import { getStoreSettings, setStoreSettings } from '../utils';

export default ({ strapi }) => ({
	async getSettings(ctx) {
		const settings = await getStoreSettings(strapi);

		ctx.send(settings);
	},

	async setSettings(ctx) {
		const payload = ctx.request.body;

		await setStoreSettings(strapi, payload);

		ctx.send({
			ok: true,
		});
	},

	async createPaymentIntent(ctx) {
		const { amount, statement_descriptor: statementDescriptor } =
			ctx.request.body;

		if (!amount) {
			return ctx.badRequest('Invalid Amount.');
		}

		try {
			const result = await strapi
				.service('plugin::paymongo.paymongo')
				.createPaymentIntent(amount, statementDescriptor);

			ctx.send(result);
		} catch (error) {
			strapi.log.error(`Error creating payment intent: ${error}`);

			ctx.badRequest(error);
		}
	},

	async attachPaymentIntent(ctx) {
		const { intentId, methodId } = ctx.request.body;

		if (!methodId || !intentId) {
			return ctx.badRequest('Invalid request.');
		}

		try {
			const result = await strapi
				.service('plugin::paymongo.paymongo')
				.attachPaymentIntent({ intentId, methodId });

			ctx.send(result);
		} catch (error) {
			strapi.log.error(`Error attaching payment intent: ${error}`);

			ctx.badRequest(error);
		}
	},

	async process3dsRedirect(ctx) {
		const { pid, vt } = ctx.query;

		if (!pid || !vt) {
			return ctx.badRequest('Invalid request.');
		}

		if (
			await strapi
				.service('plugin::paymongo.paymongo')
				.checkIfPaymentExist(pid, vt)
		) {
			ctx.badRequest('Invalid request.');
		}

		try {
			const result = await strapi
				.service('plugin::paymongo.paymongo')
				.process3dsRedirect(pid, vt);

			if (result) {
				return ctx.redirect(result);
			}

			ctx.send();
		} catch (error) {
			strapi.log.error(`Error processing 3ds redirect: ${error}`);

			ctx.badRequest(error);
		}
	},

	async createSource(ctx) {
		const { amount, billing, type } = ctx.request.body;

		if (!VALID_SOURCE_TYPES.includes(type)) {
			return ctx.badRequest('Invalid request.');
		}

		try {
			const result = await strapi
				.service('plugin::paymongo.paymongo')
				.createSource({ amount, billing, type });

			ctx.send(result);
		} catch (error) {
			strapi.log.error(`Error creating source: ${error}`);

			ctx.badRequest(error.response.text);
		}
	},

	async handleWebhook(ctx) {
		try {
			const validRequest = await strapi
				.service('plugin::paymongo.paymongo')
				.verifyWebhook({
					header: ctx.request.headers,
					payload: ctx.request.body[unparsed],
				});

			if (!validRequest) {
				throw new Error('Invalid webhook request.');
			}
		} catch (error) {
			strapi.log.error(`Error verifying webhook: ${error}`);

			return;
		}

		ctx.status = 200;
		ctx.send();

		const {
			data: { attributes, type },
		} = ctx.request.body;

		if (type === 'event' && !VALID_EVENT_TYPES.includes(type)) {
			return;
		}

		try {
			await strapi
				.service('plugin::paymongo.paymongo')
				.handleWebhook(attributes);
		} catch (error) {
			strapi.log.error(`Error confirming payment: ${error}`);
		}
	},
});

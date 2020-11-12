/**
 * paymongo.js controller
 *
 * @description: A set of functions called "actions" of the `paymongo` plugin.
 */

const _ = require('lodash');
const axios = require('axios');

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

		const payload = {
			data: {
				attributes: {
					amount: amount * 100,
					payment_method_allowed: ['card'],
					currency: 'PHP',
				},
			},
		};

		const settings = await strapi
			.store({
				environment: '',
				type: 'plugin',
				name: 'paymongo',
				key: 'settings',
			})
			.get();

		const { test_mode: testMode } = settings;
		const mode = testMode ? 'test' : 'live';

		const getKey = (identifier) => settings[`${mode}_${identifier}_key`];

		const headers = {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Basic ${Buffer.from(`${getKey('secret')}:`).toString('base64')}`,
		};

		try {
			const result = await axios.post(
				`${process.env.PAYMONGO_BASE_URL}/payment_intents`,
				payload,
				{ headers },
			);
			ctx.send(result.data);
		} catch (err) {
			const { errors } = err.response.data;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},
};

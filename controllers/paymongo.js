/**
 * paymongo.js controller
 *
 * @description: A set of functions called "actions" of the `paymongo` plugin.
 */

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

		try {
			const result = await strapi.plugins.paymongo.services.paymongo.createPaymentIntent(
				amount,
			);
			ctx.send(result.data);
		} catch (err) {
			const { errors } = err.response.data;

			ctx.status = err.response.status;
			ctx.body = { errors };

			await next();
		}
	},

	createSource: async (ctx, next) => {
		const { amount, type } = ctx.request.body;
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

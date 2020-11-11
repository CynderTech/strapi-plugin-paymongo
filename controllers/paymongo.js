/**
 * paymongo.js controller
 *
 * @description: A set of functions called "actions" of the `paymongo` plugin.
 */

const _ = require('lodash');

module.exports = {
	/**
	 * Default action.
	 *
	 * @return {Object}
	 */

	index: async (ctx) => {
		// Add your own logic here.

		// Send 200 `ok`
		ctx.send({
			message: 'ok',
		});
	},

	getSettings: async (ctx) => {
		const pluginSettingsStore = await strapi.store({
			environment: '',
			type: 'plugin',
			name: 'paymongo',
			key: 'settings',
		});

		const mode = _.get(ctx, 'query.mode', 'test');

		const getKeyIdentifier = (identifier) => `${mode}_${identifier}_key`;
		const getKey = (keyIdentifier) => pluginSettingsStore.get(keyIdentifier);

		const publicKeyIdentifier = getKeyIdentifier('public');
		const { [publicKeyIdentifier]: publicKey } = await getKey(publicKeyIdentifier);

		const secretKeyIdentifier = getKeyIdentifier('secret');
		const { [secretKeyIdentifier]: secretKey } = await getKey(secretKeyIdentifier);

		const apiKeys = {
			public_key: publicKey,
			secret_key: secretKey,
		};

		ctx.send({
			api_keys: apiKeys,
		});
	},

	setSettings: async (ctx) => {
		const pluginSettings = strapi.store({
			environment: '',
			type: 'plugin',
			name: 'paymongo',
			key: 'settings',
		});

		const settings = await pluginSettings.get();

		await pluginSettings.set({ value: { ...settings, ...ctx.request.body } });

		ctx.send({
			ok: true,
		});
	},
};

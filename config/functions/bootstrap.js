module.exports = async () => {
	const pluginStore = strapi.store({
		environment: '',
		type: 'plugin',
		name: 'paymongo',
	});

	if (!(await pluginStore.get({ key: 'settings' }))) {
		const settingsValue = {
			test_mode: true,
			live_public_key: null,
			live_secret_key: null,
			test_public_key: null,
			test_secret_key: null,
			webhook_secret_key: null,
			checkout_success_url: null,
      checkout_failure_url: null,
      checkout_success_url_mobile: null,
			checkout_failure_url_mobile: null,
		};

		await pluginStore.set({ key: 'settings', value: settingsValue });
	}
};

module.exports = async () => {
	const pluginStore = strapi.store({
		environment: '',
		type: 'plugin',
		name: 'users-permissions',
	});

	const settingsValue = {
		live_public_key: null,
		live_secret_key: null,
		test_public_key: null,
		test_secret_key: null,
	};

	await pluginStore.set({ key: 'settings', value: settingsValue });
};

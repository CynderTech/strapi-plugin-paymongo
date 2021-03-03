const { settingsValue } = require('../../constants');

module.exports = async () => {
	const pluginStore = strapi.store({
		environment: '',
		type: 'plugin',
		name: 'paymongo',
	});

	if (!(await pluginStore.get({ key: 'settings' }))) {
		await pluginStore.set({ key: 'settings', value: settingsValue });
	}
};

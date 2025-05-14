import { SETTINGS } from './constants';
import { getStoreSettings, setStoreSettings } from './utils';

export default async ({ strapi }) => {
	const pluginStore = strapi.store?.({
		environment: '',
		type: 'plugin',
		name: 'paymongo',
	});

	const settings = await pluginStore.get({
		key: 'settings',
	});

	if (!settings) {
		await pluginStore.set({
			key: 'settings',
			value: SETTINGS,
		});
	}
};

import { SETTINGS } from './constants';
import { getStoreSettings, setStoreSettings } from './utils';

export default async ({ strapi }) => {
	const settings = await getStoreSettings(strapi);

	if (!settings) {
		await setStoreSettings(strapi, SETTINGS);
	}
};

import type { Strapi } from '@strapi/types';
import PayMongo from 'paymongo-client';
import type {
	PayMongoClient,
	PayMongoKeys,
	PayMongoSettings,
	StrapiStore,
} from '../types';

export const getKeys = async (strapi: Strapi): Promise<PayMongoKeys> => {
	const settings = await getStoreSettings(strapi);

	const { test_mode: testMode } = settings;
	const mode = testMode ? 'test' : 'live';

	const getKey = (identifier) => settings[`${mode}_${identifier}_key`];

	return {
		public_key: getKey('public'),
		secret_key: getKey('secret'),
	};
};

export const getClient = async (strapi: Strapi): Promise<PayMongoClient> => {
	const { public_key: publicKey, secret_key: secretKey } =
		await getKeys(strapi);

	const client = new PayMongo(publicKey, secretKey);

	return client;
};

export const getDefaultDescription = async (
	strapi: Strapi,
	paymentId: string,
): Promise<string> => {
	const settings = await getStoreSettings(strapi);

	const { company_name: companyName } = settings;

	return `${companyName} - ${paymentId}`;
};

export const getStore = (strapi: Strapi): StrapiStore => {
	const pluginStore = strapi.store?.({
		environment: '',
		type: 'plugin',
		name: 'paymongo',
	}) as StrapiStore;

	return pluginStore;
};

export const getStoreSettings = async (
	strapi: Strapi,
): Promise<PayMongoSettings> => {
	const pluginStore = await getStore(strapi);

	const settings = (await pluginStore.get({
		key: 'settings',
	})) as PayMongoSettings;

	return settings;
};

export const setStoreSettings = async (
	strapi: Strapi,
	payload: Partial<PayMongoSettings>,
): Promise<void> => {
	const pluginStore = await getStore(strapi);
	const settings = await getStoreSettings(strapi);

	await pluginStore.set({
		key: 'settings',
		value: {
			...settings,
			...payload,
			checkout_success_url: payload.checkout_success_url
				? decodeURIComponent(payload.checkout_success_url)
				: settings.checkout_success_url,
			checkout_failure_url: payload.checkout_failure_url
				? decodeURIComponent(payload.checkout_failure_url)
				: settings.checkout_failure_url,
			checkout_success_url_mobile: payload.checkout_success_url_mobile
				? decodeURIComponent(payload.checkout_success_url_mobile)
				: settings.checkout_success_url_mobile,
			checkout_failure_url_mobile: payload.checkout_failure_url_mobile
				? decodeURIComponent(payload.checkout_failure_url_mobile)
				: settings.checkout_failure_url_mobile,
		},
	});
};

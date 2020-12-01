/**
 * paymongo.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const axios = require('axios');
const crypto = require('crypto');

const getHeaders = async (useSecret = true) => {
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
		Authorization: `Basic ${Buffer.from(`${getKey(useSecret ? 'secret' : 'public')}:`).toString(
			'base64',
		)}`,
	};

	return headers;
};

const constructPayload = (attributes) => ({
	data: { attributes },
});

module.exports = {
	createPaymentIntent: async (amount) => {
		const payload = constructPayload({
			amount: amount * 100,
			payment_method_allowed: ['card'],
			currency: 'PHP',
		});

		const result = await axios.post(
			`${process.env.PAYMONGO_BASE_URL}/payment_intents`,
			payload,
			{ headers: await getHeaders() },
		);

		return result;
	},
	createSource: async (amount, type, platform = 'web') => {
		const {
      checkout_failure_url: checkoutFailureUrlWeb,
      checkout_failure_url_mobile: checkoutFailureUrlMobile,
      checkout_success_url: checkoutSuccessUrlWeb,
      checkout_success_url_mobile: checkoutSuccessUrlMobile,
		} = await strapi
			.store({
				environment: '',
				type: 'plugin',
				name: 'paymongo',
				key: 'settings',
			})
			.get();
		const payload = constructPayload({
			type,
			amount: amount * 100,
			currency: 'PHP',
			redirect: {
				success: platform === 'web' ? checkoutSuccessUrlWeb : checkoutSuccessUrlMobile,
				failed: platform === 'web' ? checkoutFailureUrlWeb : checkoutFailureUrlMobile,
			},
		});

		const result = await axios.post(`${process.env.PAYMONGO_BASE_URL}/sources`, payload, {
			headers: await getHeaders(),
		});

		return result;
	},

	/** https://developers.paymongo.com/reference#create-a-payment */
	createPayment: async (amount, sourceId, paymentId) => {
		const payload = constructPayload({
			amount,
			description: `Ramen Kuroda - ${paymentId}`, // need to change this to a setting at some point,
			currency: 'PHP',
			source: {
				id: sourceId,
				type: 'source',
			},
		});

		const result = await axios.post(`${process.env.PAYMONGO_BASE_URL}/payments`, payload, {
			headers: await getHeaders(),
		});

		return result;
	},

	verifyWebhook: async (headers, payload) => {
		const paymongoHeader = headers['paymongo-signature'];

		if (!paymongoHeader) return false;

		const [timestamp, testSig, liveSig] = paymongoHeader.split(',');

		if (!timestamp || !testSig || !liveSig) return false;

		const { test_mode: testMode, webhook_secret_key: webhookSecretKey } = await strapi
			.store({
				environment: '',
				type: 'plugin',
				name: 'paymongo',
				key: 'settings',
			})
			.get();

		const signatureComposition = `${timestamp.slice(2)}.${payload}`;
		const hmac = crypto.createHmac('sha256', webhookSecretKey);
		hmac.update(signatureComposition, 'utf8');
		const signature = hmac.digest('hex');

		const sigToCompare = testMode ? testSig.slice(3) : liveSig.slice(3);

		return signature === sigToCompare;
	},
};

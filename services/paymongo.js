/**
 * paymongo.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const axios = require('axios');
const crypto = require('crypto');
const Paymongo = require('paymongo-client');

const getKeys = async () => {
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

	return {
    public_key: getKey('public'),
    secret_key: getKey('secret'),
  };
};

module.exports = {
	createPaymentIntent: async (amount) => {
    const { public_key: publicKey, secret_key: secretKey } = await getKeys();

    const client = new Paymongo(publicKey, secretKey);
    
    const { body } = await client.createPaymentIntent(amount);

    console.log(body);

    return body;
	},
	createSource: async (amount, type) => {
		const {
			checkout_failure_url: checkoutFailureUrl,
			checkout_success_url: checkoutSuccessUrl,
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
				success: checkoutSuccessUrl,
				failed: checkoutFailureUrl,
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

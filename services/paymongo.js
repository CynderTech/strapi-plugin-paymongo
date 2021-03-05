/**
 * paymongo.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const PayMongo = require('paymongo-client').default;

const pluginPkg = require('../package.json');

const { name: pluginName } = pluginPkg.strapi;

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

const getClient = async () => {
	const { public_key: publicKey, secret_key: secretKey } = await getKeys();

	const client = new PayMongo(publicKey, secretKey);

	return client;
};

const getDefaultDescription = async (paymentId) => {
	const pluginStore = strapi.store({
		environment: '',
		type: 'plugin',
		name: pluginName,
		key: 'settings',
	});

	const { company_name: companyName } = await pluginStore.get();

	return `${companyName} - ${paymentId}`;
};

module.exports = {
	createPaymentIntent: async ({ paymentId, ...payload }) => {
		const client = await getClient();

		const { body } = await client.createPaymentIntent({
			...payload,
			description: `${await getDefaultDescription(paymentId)}${
				payload.statement_descriptor
					? ` - ${payload.statement_descriptor}`
					: ''
			}`,
		});

		return body;
	},

	attachPaymentIntent: async (payload) => {
		const client = await getClient();

		const pluginStore = strapi.store({
			environment: '',
			type: 'plugin',
			name: pluginName,
			key: 'settings',
		});

		const { use_3ds_redirect: use3dsRedirect } = await pluginStore.get();

		const overrides = {};

		if (use3dsRedirect && typeof payload.redirect === 'undefined') {
			const { url: serverUrl } = strapi.config.server;

			const payment = await strapi
				.query('paymongo-payments', pluginName)
				.findOne({ paymentIntentId: payload.intentId });

			if (payment && Object.keys(payment).length > 0) {
				overrides.redirect = `${
					serverUrl || 'http://localhost:1337'
				}/paymongo/process-3ds-redirect?pid=${payment.paymentId}&vt=${
					payment.verificationToken
				}`;
			}
		}

		const { body } = await client.attachPaymentIntent({
			...payload,
			...overrides,
		});

		return body;
	},

	retrievePaymentIntent: async (intentId) => {
		const client = await getClient();

		const { body } = await client.retrievePaymentIntent(intentId);

		return body;
	},

	createSource: async (amount, type) => {
		const pluginStore = strapi.store({
			environment: '',
			type: 'plugin',
			name: pluginName,
			key: 'settings',
		});

		const {
			checkout_failure_url: checkoutFailureUrl,
			checkout_success_url: checkoutSuccessUrl,
		} = await pluginStore.get();

		const client = await getClient();

		const { body } = await client.createSource({
			amount,
			type,
			redirect: {
				success: checkoutSuccessUrl,
				failed: checkoutFailureUrl,
			},
		});

		return body;
	},

	/** https://developers.paymongo.com/reference#create-a-payment */
	createPayment: async (amount, sourceId, paymentId) => {
		const client = await getClient();

		const { body } = await client.createPayment({
			amount,
			description: await getDefaultDescription(paymentId),
			source: {
				id: sourceId,
				type: 'source',
			},
		});

		return body;
	},

	verifyWebhook: async (headers, payload) => {
		const paymongoHeader = headers['paymongo-signature'];

		if (!paymongoHeader) return false;

		const {
			test_mode: testMode,
			webhook_secret_key: webhookSecretKey,
		} = await strapi
			.store({
				environment: '',
				type: 'plugin',
				name: 'paymongo',
				key: 'settings',
			})
			.get();

		return PayMongo.verifyWebhook(
			webhookSecretKey,
			paymongoHeader,
			payload,
			testMode ? 'test' : 'live',
		);
	},
};

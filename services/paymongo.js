/**
 * paymongo.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const Paymongo = require('paymongo-client').default;

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

	const client = new Paymongo(publicKey, secretKey);

	return client;
};

module.exports = {
	createPaymentIntent: async ({ paymentId, ...payload }) => {
    const client = await getClient();

    const pluginStore = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'paymongo',
        key: 'settings',
      });
    
    const {
      company_name: companyName,
    } = pluginStore.get();
    
		const { body } = await client.createPaymentIntent({
      ...payload,
      description: `${companyName} - ${paymentId}`,
    });

		return body;
	},

  attachPaymentIntent: async (intentId, methodId) => {
    const attachMethodData = { intentId, methodId };

    const pluginStore = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'paymongo',
        key: 'settings',
      });
    
    const {
      use_3ds_redirect: use3dsRedirect,
    } = pluginStore.get();

    if (use3dsRedirect) {
      const { url: serverUrl } = strapi.config.server;

      attachMethodData.redirect = `${serverUrl}/process-3ds-redirect`;
    }

    const { body } = await client.attachPaymentIntent(attachMethodData);

    return body;
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

    const client = await getClient();
    
    const checkoutSuccessUrl = platform === 'web' ? checkoutSuccessUrlWeb : checkoutSuccessUrlMobile;
    const checkoutFailureUrl = platform === 'web' ? checkoutFailureUrlWeb : checkoutFailureUrlMobile;

		const { body } = await client.createSource(
			amount,
			type,
			checkoutSuccessUrl,
			checkoutFailureUrl,
		);

		return body;
	},

	/** https://developers.paymongo.com/reference#create-a-payment */
	createPayment: async (amount, sourceId, paymentId) => {
		const client = await getClient();

		/** Need to change description to a setting at some point */
		const { body } = await client.createPayment(
			amount,
			sourceId,
			`Ramen Kuroda - ${paymentId}`,
		);

		return body;
	},

	verifyWebhook: async (headers, payload) => {
		const paymongoHeader = headers['paymongo-signature'];

		if (!paymongoHeader) return false;

		const { test_mode: testMode, webhook_secret_key: webhookSecretKey } = await strapi
			.store({
				environment: '',
				type: 'plugin',
				name: 'paymongo',
				key: 'settings',
			})
			.get();

		return Paymongo.verifyWebhook(
			webhookSecretKey,
			paymongoHeader,
			payload,
			testMode ? 'test' : 'live',
		);
	},
};

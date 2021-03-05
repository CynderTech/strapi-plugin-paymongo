const SETTINGS = {
	test_mode: true,
	company_name: null,
	live_public_key: null,
	live_secret_key: null,
	test_public_key: null,
	test_secret_key: null,
	webhook_secret_key: null,
	use_3ds_redirect: false,
	checkout_success_url: null,
	checkout_failure_url: null,
	checkout_success_url_mobile: null,
	checkout_failure_url_mobile: null,
};

const PAYMENT_INTENT_STATUSES = {
	AWAITING_PAYMENT_METHOD: 'awaiting_payment_method',
	AWAITING_NEXT_ACTION: 'awaiting_next_action',
	PROCESSING: 'processing',
	SUCCEEDED: 'succeeded',
};

const PAYMONGO_PAYMENT_STATUSES = {
	PENDING: 'pending',
	FAILED: 'failed',
	PAID: 'paid',
};

module.exports = {
	SETTINGS,
	PAYMENT_INTENT_STATUSES,
	PAYMONGO_PAYMENT_STATUSES,
};

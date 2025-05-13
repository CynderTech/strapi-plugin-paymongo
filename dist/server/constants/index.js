"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_EVENT_TYPES = exports.VALID_SOURCE_TYPES = exports.PAYMONGO_PAYMENT_STATUSES = exports.PAYMENT_INTENT_STATUSES = exports.SETTINGS = void 0;
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
exports.SETTINGS = SETTINGS;
const PAYMENT_INTENT_STATUSES = {
    AWAITING_PAYMENT_METHOD: 'awaiting_payment_method',
    AWAITING_NEXT_ACTION: 'awaiting_next_action',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
};
exports.PAYMENT_INTENT_STATUSES = PAYMENT_INTENT_STATUSES;
const PAYMONGO_PAYMENT_STATUSES = {
    PENDING: 'pending',
    FAILED: 'failed',
    PAID: 'paid',
};
exports.PAYMONGO_PAYMENT_STATUSES = PAYMONGO_PAYMENT_STATUSES;
const VALID_SOURCE_TYPES = ['gcash', 'grab_pay'];
exports.VALID_SOURCE_TYPES = VALID_SOURCE_TYPES;
const VALID_EVENT_TYPES = ['source.chargeable'];
exports.VALID_EVENT_TYPES = VALID_EVENT_TYPES;

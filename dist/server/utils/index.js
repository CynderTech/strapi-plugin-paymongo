"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStoreSettings = exports.getStoreSettings = exports.getStore = exports.getDefaultDescription = exports.getClient = exports.getKeys = void 0;
const paymongo_client_1 = __importDefault(require("paymongo-client"));
const getKeys = async (strapi) => {
    const settings = await (0, exports.getStoreSettings)(strapi);
    const { test_mode: testMode } = settings;
    const mode = testMode ? 'test' : 'live';
    const getKey = (identifier) => settings[`${mode}_${identifier}_key`];
    return {
        public_key: getKey('public'),
        secret_key: getKey('secret'),
    };
};
exports.getKeys = getKeys;
const getClient = async (strapi) => {
    const { public_key: publicKey, secret_key: secretKey } = await (0, exports.getKeys)(strapi);
    const client = new paymongo_client_1.default(publicKey, secretKey);
    return client;
};
exports.getClient = getClient;
const getDefaultDescription = async (strapi, paymentId) => {
    const settings = await (0, exports.getStoreSettings)(strapi);
    const { company_name: companyName } = settings;
    return `${companyName} - ${paymentId}`;
};
exports.getDefaultDescription = getDefaultDescription;
const getStore = (strapi) => {
    var _a;
    const pluginStore = (_a = strapi.store) === null || _a === void 0 ? void 0 : _a.call(strapi, {
        environment: '',
        type: 'plugin',
        name: 'paymongo',
    });
    return pluginStore;
};
exports.getStore = getStore;
const getStoreSettings = async (strapi) => {
    const pluginStore = await (0, exports.getStore)(strapi);
    const settings = await pluginStore.get({ key: 'settings' });
    return settings;
};
exports.getStoreSettings = getStoreSettings;
const setStoreSettings = async (strapi, payload) => {
    const pluginStore = await (0, exports.getStore)(strapi);
    const settings = await (0, exports.getStoreSettings)(strapi);
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
exports.setStoreSettings = setStoreSettings;

"use strict";
/**
 *  PayMongo service
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymongo_client_1 = __importDefault(require("paymongo-client"));
const utils_1 = require("../utils");
const constants_1 = require("../constants");
exports.default = ({ strapi }) => ({
    async createPaymentIntent(amount, statementDescriptor) {
        const newPayment = await strapi.entityService.create('plugin::paymongo.paymongo', {
            data: {
                type: 'cc',
            },
        });
        const { id, paymentId } = newPayment;
        const client = await (0, utils_1.getClient)(strapi);
        const { body } = await client.createPaymentIntent({
            amount,
            paymentId: paymentId,
            statement_descriptor: statementDescriptor,
            description: `${await (0, utils_1.getDefaultDescription)(strapi, paymentId)}${statementDescriptor ? ` - ${statementDescriptor}` : ''}`,
        });
        const { data: { id: paymentIntentId }, } = body;
        strapi.entityService.update('plugin::paymongo.paymongo', id, {
            data: {
                paymentIntentId,
            },
        });
        return body;
    },
    async attachPaymentIntent(payload) {
        const client = await (0, utils_1.getClient)(strapi);
        const settings = await (0, utils_1.getStoreSettings)(strapi);
        const { use_3ds_redirect: use3dsRedirect } = settings;
        let overrides = {};
        if (use3dsRedirect && typeof payload.return_url === 'undefined') {
            const { url: serverUrl } = strapi.config.server;
            const [payment] = await strapi.entityService.findMany('plugin::paymongo.paymongo', {
                filters: {
                    paymentIntentId: payload.id,
                },
            });
            if (payment && Object.keys(payment).length > 0) {
                overrides = {
                    redirect: `${serverUrl || 'http://localhost:1337'}/paymongo/process-3ds-redirect?pid=
                        ${payment.paymentId}&vt=${payment.verificationToken}`,
                };
            }
        }
        const { body } = await client.attachPaymentIntent({
            ...payload,
            ...overrides,
        });
        const { data: { attributes }, } = body;
        const { status } = attributes;
        if (status === 'succeeded') {
            const [payment] = await strapi.entityService.findMany('plugin::paymongo.paymongo', {
                filters: {
                    paymentIntentId: payload.id,
                },
            });
            strapi.entityService.update('plugin::paymongo.paymongo', payment.id, {
                data: {
                    status: 'success',
                },
            });
        }
        return body;
    },
    async createSource({ amount, billing, type, }) {
        const settings = await (0, utils_1.getStoreSettings)(strapi);
        const { checkout_failure_url: checkoutFailureUrl, checkout_success_url: checkoutSuccessUrl, } = settings;
        const client = await (0, utils_1.getClient)(strapi);
        const { body } = await client.createSource({
            amount,
            type,
            redirect: {
                failed: checkoutFailureUrl,
                success: checkoutSuccessUrl,
            },
            billing,
        });
        const { data: { id: sourceId }, } = body;
        await strapi.entityService.create('plugin::paymongo.paymongo', {
            data: {
                type,
                sourceId,
            },
        });
        return body;
    },
    async createPayment({ amount, sourceId, paymentId, statementDescriptor = null, }) {
        const client = await (0, utils_1.getClient)(strapi);
        const { body } = await client.createPayment({
            amount,
            description: `${await (0, utils_1.getDefaultDescription)(strapi, paymentId)}${statementDescriptor ? ` - ${statementDescriptor}` : ''}`,
            source: {
                id: sourceId,
                type: 'source',
            },
        });
        return body;
    },
    async retrievePaymentIntent(intentId) {
        const client = await (0, utils_1.getClient)(strapi);
        const { body } = await client.retrievePaymentIntent(intentId);
        return body;
    },
    async checkIfPaymentExist(pid, vt) {
        const [payment] = await strapi.entityService.findMany('plugin::paymongo.paymongo', {
            filters: {
                verificationToken: vt,
                paymentId: pid,
            },
        });
        return !payment || Object.keys(payment).length === 0;
    },
    async process3dsRedirect(pid, vt) {
        const [payment] = await strapi.entityService.findMany('plugin::paymongo.paymongo', {
            filters: {
                verificationToken: vt,
                paymentId: pid,
            },
        });
        const result = await strapi
            .service('plugin::paymongo.paymongo')
            .retrievePaymentIntent(payment.paymentIntentId);
        const { data: { attributes }, } = result;
        const { status } = attributes;
        const settings = await (0, utils_1.getStoreSettings)(strapi);
        const { checkout_failure_url: checkoutFailureUrl, checkout_success_url: checkoutSuccessUrl, } = settings;
        if (status === constants_1.PAYMENT_INTENT_STATUSES.SUCCEEDED) {
            strapi.entityService.update('plugin::paymongo.paymongo', payment.id, {
                data: {
                    status: 'success',
                    rawResponse: result,
                },
            });
            return checkoutSuccessUrl;
        }
        if (status === constants_1.PAYMENT_INTENT_STATUSES.AWAITING_PAYMENT_METHOD) {
            await strapi.entityService.update('plugin::paymongo.paymongo', payment.id, {
                data: {
                    status: 'fail',
                    rawResponse: result,
                },
            });
            return checkoutFailureUrl;
        }
        if (status === constants_1.PAYMENT_INTENT_STATUSES.PROCESSING) {
            // Need CRON job or schedule job for this OR wait for the webhook for payments
            return null;
        }
        if (status === constants_1.PAYMENT_INTENT_STATUSES.AWAITING_NEXT_ACTION) {
            // This will probably never happen, but in case that it did, do something
            return null;
        }
        return null;
    },
    async verifyWebhook({ header, payload, }) {
        const paymongoHeader = header['paymongo-signature'];
        if (!paymongoHeader)
            return false;
        const settings = await (0, utils_1.getStoreSettings)(strapi);
        const { test_mode: testMode, webhook_secret_key: webhookSecretKey } = settings;
        return paymongo_client_1.default.verifyWebhook(webhookSecretKey, paymongoHeader, payload, testMode ? 'test' : 'live');
    },
    async handleWebhook(attributes) {
        const { data: { attributes: { amount, status, type: sourceType }, id: sourceId, }, } = attributes;
        if (status === 'chargeable') {
            const [payment] = await strapi.entityService.findMany('plugin::paymongo.paymongo', {
                filters: {
                    sourceId,
                    type: sourceType,
                },
            });
            if (!payment || Object.keys(payment).length === 0) {
                strapi.log.error('No matching payment found');
                return;
            }
            const { id, paymentId } = payment;
            const result = await strapi
                .service('plugin::paymongo.paymongo')
                .createPayment({
                amount,
                sourceId,
                paymentId,
            });
            const { data: { attributes: { status: paymongoPaymentStatus }, }, } = result;
            let paymentStatus;
            switch (paymongoPaymentStatus) {
                case constants_1.PAYMONGO_PAYMENT_STATUSES.PAID:
                    paymentStatus = 'success';
                    break;
                case constants_1.PAYMONGO_PAYMENT_STATUSES.FAILED:
                    paymentStatus = 'fail';
                    break;
                case constants_1.PAYMONGO_PAYMENT_STATUSES.PENDING:
                    paymentStatus = 'pending';
                    break;
                default:
                    paymentStatus = 'pending';
            }
            await strapi.entityService.update('plugin::paymongo.paymongo', id, {
                data: {
                    status: paymentStatus,
                    rawResponse: result,
                },
            });
        }
    },
});

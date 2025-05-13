"use strict";
/**
 *  PayMongo Server routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    {
        method: 'POST',
        path: '/payment-intent',
        handler: 'paymongo.createPaymentIntent',
        config: {
            policies: [],
            auth: false
        },
    },
    {
        method: 'POST',
        path: '/payment-intent/attach',
        handler: 'paymongo.attachPaymentIntent',
        config: {
            policies: [],
            auth: false,
        },
    },
    {
        method: 'POST',
        path: '/source',
        handler: 'paymongo.createSource',
        config: {
            policies: [],
            auth: false,
        },
    },
    {
        method: 'POST',
        path: '/webhook',
        handler: 'paymongo.handleWebhook',
        config: {
            policies: [],
            auth: false,
        },
    },
    {
        method: 'GET',
        path: '/process-3ds-redirect',
        handler: 'paymongo.process3dsRedirect',
        config: {
            policies: [],
            auth: false,
        },
    },
];

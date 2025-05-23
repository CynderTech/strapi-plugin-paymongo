"use strict";
/**
 *  PayMongo controller
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unparsed_1 = __importDefault(require("koa-body/unparsed"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
exports.default = ({ strapi }) => ({
    async getSettings(ctx) {
        const settings = await (0, utils_1.getStoreSettings)(strapi);
        ctx.send(settings);
    },
    async setSettings(ctx) {
        const payload = ctx.request.body;
        await (0, utils_1.setStoreSettings)(strapi, payload);
        ctx.send({
            ok: true,
        });
    },
    async createPaymentIntent(ctx) {
        const { amount, statement_descriptor: statementDescriptor } = ctx.request.body;
        if (!amount) {
            return ctx.badRequest('Invalid Amount.');
        }
        try {
            const result = await strapi
                .service('plugin::paymongo.paymongo')
                .createPaymentIntent(amount, statementDescriptor);
            ctx.send(result);
        }
        catch (error) {
            strapi.log.error(`Error creating payment intent: ${error}`);
            ctx.badRequest(error);
        }
    },
    async attachPaymentIntent(ctx) {
        const { intentId, methodId } = ctx.request.body;
        if (!methodId || !intentId) {
            return ctx.badRequest('Invalid request.');
        }
        try {
            const result = await strapi
                .service('plugin::paymongo.paymongo')
                .attachPaymentIntent({ intentId, methodId });
            ctx.send(result);
        }
        catch (error) {
            strapi.log.error(`Error attaching payment intent: ${error}`);
            ctx.badRequest(error);
        }
    },
    async process3dsRedirect(ctx) {
        const { pid, vt } = ctx.query;
        if (!pid || !vt) {
            return ctx.badRequest('Invalid request.');
        }
        if (await strapi
            .service('plugin::paymongo.paymongo')
            .checkIfPaymentExist(pid, vt)) {
            ctx.badRequest('Invalid request.');
        }
        try {
            const result = await strapi
                .service('plugin::paymongo.paymongo')
                .process3dsRedirect(pid, vt);
            if (result) {
                return ctx.redirect(result);
            }
            ctx.send();
        }
        catch (error) {
            strapi.log.error(`Error processing 3ds redirect: ${error}`);
            ctx.badRequest(error);
        }
    },
    async createSource(ctx) {
        const { amount, billing, type } = ctx.request.body;
        if (!constants_1.VALID_SOURCE_TYPES.includes(type)) {
            return ctx.badRequest('Invalid request.');
        }
        try {
            const result = await strapi
                .service('plugin::paymongo.paymongo')
                .createSource({ amount, billing, type });
            ctx.send(result);
        }
        catch (error) {
            strapi.log.error(`Error creating source: ${error}`);
            ctx.badRequest(error.response.text);
        }
    },
    async handleWebhook(ctx) {
        try {
            const validRequest = await strapi
                .service('plugin::paymongo.paymongo')
                .verifyWebhook({
                header: ctx.request.headers,
                payload: ctx.request.body[unparsed_1.default],
            });
            if (!validRequest) {
                throw new Error('Invalid webhook request.');
            }
        }
        catch (error) {
            strapi.log.error(`Error verifying webhook: ${error}`);
            return;
        }
        ctx.status = 200;
        ctx.send();
        const { data: { attributes, type }, } = ctx.request.body;
        if (type === 'event' && !constants_1.VALID_EVENT_TYPES.includes(type)) {
            return;
        }
        try {
            await strapi
                .service('plugin::paymongo.paymongo')
                .handleWebhook(attributes);
        }
        catch (error) {
            strapi.log.error(`Error confirming payment: ${error}`);
        }
    },
});

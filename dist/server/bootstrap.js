"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
exports.default = async ({ strapi }) => {
    var _a;
    const pluginStore = (_a = strapi.store) === null || _a === void 0 ? void 0 : _a.call(strapi, {
        environment: '',
        type: 'plugin',
        name: 'paymongo',
    });
    const settings = await pluginStore.get({
        key: 'settings',
    });
    if (!settings) {
        await pluginStore.set({
            key: 'settings',
            value: constants_1.SETTINGS,
        });
    }
};

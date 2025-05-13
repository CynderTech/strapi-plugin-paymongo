"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const utils_1 = require("./utils");
exports.default = async ({ strapi }) => {
    const settings = await (0, utils_1.getStoreSettings)(strapi);
    if (!settings) {
        await (0, utils_1.setStoreSettings)(strapi, constants_1.SETTINGS);
    }
};

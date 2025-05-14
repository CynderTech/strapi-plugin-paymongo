"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)('1234567890ABCDEF', 15);
const lifecycles = {
    async beforeCreate(event) {
        event.params.data.paymentId = nanoid();
        event.params.data.verificationToken = nanoid();
    },
};
exports.default = lifecycles;

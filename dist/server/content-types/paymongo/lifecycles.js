"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const nanoid = (0, nanoid_1.customAlphabet)('1234567890ABCDEF', 15);
const lifecycle = {
    async beforeCreate(event) {
        let { data } = event.params;
        data = {
            ...data,
            paymentId: nanoid(),
            verificationToken: nanoid()
        };
    },
};
exports.default = lifecycle;

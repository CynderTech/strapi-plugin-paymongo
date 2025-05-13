"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymongo_1 = __importDefault(require("./paymongo"));
const lifecycles_1 = __importDefault(require("./paymongo/lifecycles"));
exports.default = {
    paymongo: {
        schema: paymongo_1.default,
        lifecycles: lifecycles_1.default
    },
};

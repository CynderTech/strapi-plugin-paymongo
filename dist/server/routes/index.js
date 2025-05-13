"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = __importDefault(require("./admin"));
const server_1 = __importDefault(require("./server"));
exports.default = {
    'paymongo-admin': {
        type: 'admin',
        routes: [
            ...admin_1.default
        ]
    },
    paymongo: {
        type: 'content-api',
        routes: [
            ...server_1.default
        ]
    }
};

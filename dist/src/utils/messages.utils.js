"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const formatMessage = (username, text) => {
    return {
        user: username,
        content: text,
    };
};
exports.default = formatMessage;

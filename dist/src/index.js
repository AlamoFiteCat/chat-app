"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const chat_server_1 = require("./chat-server");
let app = new chat_server_1.ChatServer().getApp();
exports.app = app;

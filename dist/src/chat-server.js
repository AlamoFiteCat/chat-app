"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServer = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const http = __importStar(require("http"));
const users_utils_1 = __importDefault(require("./utils/users.utils"));
const messages_utils_1 = __importDefault(require("./utils/messages.utils"));
const path_1 = __importDefault(require("path"));
class ChatServer {
    constructor() {
        this.botName = "chatBot";
        this.createApp();
        this.configServer();
        this.createServer();
        this.socketsConfig();
        this.serverListen();
    }
    createApp() {
        this.app = express_1.default();
        this.app.set("trust proxy", 1); // trust first proxy
        this.app.use(cors_1.default());
        this.app.use(helmet_1.default());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, "static")));
    }
    createServer() {
        this.server = http.createServer(this.app);
    }
    configServer() {
        this.port = process.env.PORT || ChatServer.PORT;
    }
    socketsConfig() {
        this.io = require("socket.io")(this.server, {
            cors: {
                origin: "http://localhost:4200",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type, Accept, APPKEY, withCredentials"],
                credentials: true,
            },
        });
    }
    serverListen() {
        this.server.listen(this.port, () => {
            console.log(`Running server on http://localhost:${this.port}`);
        });
        this.io.on("connect", (socket) => {
            // [User Joined]
            socket.on("joinRoom", ({ username, room }) => {
                const user = users_utils_1.default.userJoin(socket.id, username, room);
                socket.join(user.room);
                socket.emit("message", messages_utils_1.default(this.botName, "Welcome to ChatCord!"));
                socket.broadcast
                    .to(user.room)
                    .emit("message", messages_utils_1.default(this.botName, `${user.username} has joined the chat`));
                this.io.to(user.room).emit("roomUsers", {
                    room: user.room,
                    users: users_utils_1.default.getRoomUsers(user.room),
                });
            });
            // [Message Received]
            socket.on("message", (m) => {
                this.io.emit("message", messages_utils_1.default(m.user, m.content));
            });
            // [User Disconnected]
            socket.on("disconnect", () => {
                const user = users_utils_1.default.userLeave(socket.id);
                if (user) {
                    this.io
                        .to(user.room)
                        .emit("message", messages_utils_1.default(this.botName, `${user.username} has left the chat.`));
                    this.io.to(user.room).emit("roomUsers", {
                        room: user.room,
                        users: users_utils_1.default.getRoomUsers(user.room),
                    });
                }
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.ChatServer = ChatServer;
ChatServer.PORT = 8080;

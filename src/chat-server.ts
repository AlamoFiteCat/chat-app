import express from "express";
import helmet from "helmet";
import cors from "cors";
import * as http from "http";
import { Message } from "./interfaces/message.interface";
import { Socket } from "socket.io";
import userUtils from "./utils/users.utils";
import formatMessage from "./utils/messages.utils";
import path from "path";

export class ChatServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: http.Server;
  private io: SocketIO.Server;
  private port: string | number;
  private botName = "chatBot";

  constructor() {
    this.createApp();
    this.configServer();
    this.createServer();
    this.socketsConfig();
    this.serverListen();
  }

  private createApp(): void {
    this.app = express();
    this.app.set("trust proxy", 1); // trust first proxy
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.static(path.join(__dirname, "static")));
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private configServer(): void {
    this.port = process.env.PORT || ChatServer.PORT;
  }

  private socketsConfig(): void {
    this.io = require("socket.io")(this.server, {
      cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type, Accept, APPKEY, withCredentials"],
        credentials: true,
      },
    });
  }

  private serverListen(): void {
    this.server.listen(this.port, () => {
      console.log(`Running server on http://localhost:${this.port}`);
    });

    this.io.on("connect", (socket: Socket) => {
      // [User Joined]
      socket.on("joinRoom", ({ username, room }) => {
        const user = userUtils.userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit(
          "message",
          formatMessage(this.botName, "Welcome to ChatCord!")
        );

        socket.broadcast
          .to(user.room)
          .emit(
            "message",
            formatMessage(this.botName, `${user.username} has joined the chat`)
          );

        this.io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: userUtils.getRoomUsers(user.room),
        });
      });

      // [Message Received]
      socket.on("message", (m: Message) => {
        this.io.emit("message", formatMessage(m.user, m.content));
      });

      // [User Disconnected]
      socket.on("disconnect", () => {
        const user = userUtils.userLeave(socket.id);

        if (user) {
          this.io
            .to(user.room)
            .emit(
              "message",
              formatMessage(this.botName, `${user.username} has left the chat.`)
            );

          this.io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: userUtils.getRoomUsers(user.room),
          });
        }
      });
    });
  }
  public getApp(): express.Application {
    return this.app;
  }
}

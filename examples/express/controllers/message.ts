import "reflect-metadata";

import { inject, injectable } from "inversify";
import type { Socket } from "socket.io";

import {
  connectedSocket,
  controller,
  onConnect,
  onDisconnect,
  onMessage,
  payload,
} from "inversify-socket-utils";

import { UserService } from "../services/user";

@injectable()
@controller("/")
export class MessageController {
  constructor(@inject(UserService) private readonly users: UserService) {}

  @onConnect("connection")
  connection(@connectedSocket() socket: Socket): void {
    console.log(`[ws] client connected: ${socket.id}`);
    socket.emit("connected", { totalUsers: this.users.total() });
  }

  @onMessage("message")
  message(@connectedSocket() socket: Socket, @payload() data: unknown): void {
    socket.emit("message", `echo: ${JSON.stringify(data)}`);
  }

  @onDisconnect("disconnect")
  disconnect(): void {
    console.log("[ws] client disconnected");
  }
}

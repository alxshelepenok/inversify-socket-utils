import "reflect-metadata";

import { injectable } from "inversify";
import { Socket } from "socket.io";

import {
  connectedSocket,
  controller,
  onConnect,
  onDisconnect,
  onMessage,
} from "inversify-socket-utils";

@injectable()
@controller("/namespace")
export class MessageController {
  @onConnect("connection")
  connection() {
    console.log("client connected");
  }

  @onDisconnect("disconnect")
  disconnect() {
    console.log("client disconnected");
  }

  @onMessage("message")
  message(@connectedSocket() socket: Socket) {
    console.log("message received");
    socket.emit("message", "hello!");
  }
}

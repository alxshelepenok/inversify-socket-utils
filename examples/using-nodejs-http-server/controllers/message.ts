import { injectable } from "inversify";
import {Controller, Payload, ConnectedSocket, OnConnect, OnDisconnect, OnMessage} from "../../../src";
import "reflect-metadata";

@injectable()
@Controller(
  '/namespace'
)
export class MessageController {
  @OnConnect("connection")
    connection() {
        console.log("Client connected");
    }

    @OnDisconnect("disconnect")
    disconnect() {
        console.log("Client disconnected");
    }

    @OnMessage("message")
    message(@Payload() payload: any, @ConnectedSocket() socket: any) {
        console.log("Message received");
        socket.emit("message", "Hello!");
    }
}

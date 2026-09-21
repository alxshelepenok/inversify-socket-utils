import "reflect-metadata";


import { io } from "socket.io-client";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "bun:test";
import type { Server, Socket } from "socket.io";
import { Container, injectable } from "inversify";
import { Server as SocketIOServer } from "socket.io";
import { createServer, IncomingMessage } from "node:http";
import { TYPE } from "./constants";
import {
  connectedSocket,
  controller,
  onConnect,
  onDisconnect,
  onMessage,
  payload,
  socketID,
  socketIO,
  socketQueryParam,
  socketRequest,
  socketRooms,
} from "./decorators";
import type * as interfaces from "./interfaces";
import { InversifySocketServer } from "./server";

let disconnectHandled = false;

@injectable()
@controller("/test")
class TestController {
  @onConnect("connection")
  connection(
    @connectedSocket() socket: Socket,
    @socketID() id: string,
  ): void {
    socket.emit("connected", { id });
  }

  @onMessage("echo")
  echo(
    @connectedSocket() socket: Socket,
    @payload() data: unknown,
    @socketQueryParam("q") query: unknown,
    @socketIO() io: Server,
    @socketID() id: string,
    @socketRooms() rooms: Set<string>,
    @socketRequest() request: IncomingMessage,
  ): void {
    socket.emit("echo:reply", {
      data,
      query,
      id,
      sameServer: io === ioServer,
      roomsCount: rooms.size,
      hasRequest: request instanceof IncomingMessage,
    });
  }

  @onDisconnect("disconnect")
  disconnected(): void {
    disconnectHandled = true;
  }
}

const httpServer = createServer();
const ioServer = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

const container = new Container();
container.bind<interfaces.Controller>(TYPE.Controller).to(TestController);
new InversifySocketServer(container, ioServer).build();

const once = <T>(client: { once: (e: string, cb: (v: T) => void) => void }, event: string) =>
  new Promise<T>((resolve) => client.once(event, resolve));

const waitUntil = async (
  predicate: () => boolean,
  timeoutMs = 3000,
): Promise<void> => {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Condition was not met within the timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
};

describe("InversifySocketServer", () => {
  it("handles the connection, message and disconnect lifecycle", async () => {
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    const { port } = httpServer.address() as AddressInfo;

    const client = io(`http://127.0.0.1:${port}/test`, {
      query: { q: "1" },
      transports: ["websocket"],
    });

    const connected = once<{ id: string }>(client, "connected");
    const connectedPayload = await connected;
    expect(typeof connectedPayload.id).toBe("string");

    const reply = once<{
      data: unknown;
      query: unknown;
      id: string;
      sameServer: boolean;
      roomsCount: number;
      hasRequest: boolean;
    }>(client, "echo:reply");
    client.emit("echo", { hello: "world" });
    const replyPayload = await reply;

    expect(replyPayload.data).toEqual({ hello: "world" });
    expect(replyPayload.query).toBe("1");
    expect(replyPayload.id).toBe(connectedPayload.id);
    expect(replyPayload.sameServer).toBe(true);
    expect(replyPayload.roomsCount).toBeGreaterThan(0);
    expect(replyPayload.hasRequest).toBe(true);

    client.disconnect();
    await waitUntil(() => disconnectHandled);
    client.close();
  });
});

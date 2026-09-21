import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import {
  ACTION_TYPE,
  METADATA_KEY,
  PARAMETER_TYPE,
} from "./constants";

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

describe("controller", () => {
  it("stores controller metadata on the target", () => {
    class Target {}

    controller("/chat")(Target);

    const metadata = Reflect.getMetadata(
      METADATA_KEY.Controller,
      Target,
    ) as { namespace: string; target: unknown };

    expect(metadata.namespace).toBe("/chat");
    expect(metadata.target).toBe(Target);
  });

  it("prepends the controller to the global registry", () => {
    Reflect.deleteMetadata(METADATA_KEY.Controller, Reflect);

    class First {}
    class Second {}

    controller("/first")(First);
    controller("/second")(Second);

    const registry = Reflect.getMetadata(
      METADATA_KEY.Controller,
      Reflect,
    ) as Array<{ namespace: string }>;

    expect(registry.map((item) => item.namespace)).toEqual([
      "/second",
      "/first",
    ]);
  });
});

describe("action decorators", () => {
  it("onConnect registers a connect action", () => {
    class Target {
      connected() {}
    }

    onConnect("connection")(Target.prototype, "connected");

    const actions = Reflect.getMetadata(
      METADATA_KEY.Action,
      Target,
    ) as Array<{ key: string; name: string; type: ACTION_TYPE }>;

    expect(actions).toHaveLength(1);
    expect(actions[0].key).toBe("connected");
    expect(actions[0].name).toBe("connection");
    expect(actions[0].type).toBe(ACTION_TYPE.CONNECT);
  });

  it("onDisconnect registers a disconnect action", () => {
    class Target {
      disconnected() {}
    }

    onDisconnect("disconnect")(Target.prototype, "disconnected");

    const actions = Reflect.getMetadata(
      METADATA_KEY.Action,
      Target,
    ) as Array<{ key: string; name: string; type: ACTION_TYPE }>;

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe(ACTION_TYPE.DISCONNECT);
  });

  it("onMessage registers a message action and appends entries", () => {
    class Target {
      first() {}
      second() {}
    }

    onMessage("first-event")(Target.prototype, "first");
    onMessage("second-event")(Target.prototype, "second");

    const actions = Reflect.getMetadata(
      METADATA_KEY.Action,
      Target,
    ) as Array<{ key: string; name: string; type: ACTION_TYPE }>;

    expect(actions).toHaveLength(2);
    expect(actions[0].name).toBe("first-event");
    expect(actions[1].name).toBe("second-event");
    expect(actions.every((a) => a.type === ACTION_TYPE.MESSAGE)).toBe(true);
  });
});

describe("parameter decorators", () => {
  it("registers parameter metadata grouped by method name", () => {
    class Target {
      handler() {}
    }

    connectedSocket()(Target.prototype, "handler", 0);
    payload()(Target.prototype, "handler", 1);
    socketQueryParam("room")(Target.prototype, "handler", 2);

    const parameters = Reflect.getMetadata(
      METADATA_KEY.Parameter,
      Target,
    ) as Record<
      string,
      Array<{ index: number; name: string; type: PARAMETER_TYPE }>
    >;

    expect(parameters.handler).toHaveLength(3);
    expect(parameters.handler.map((p) => p.index)).toEqual([2, 1, 0]);
    expect(parameters.handler[0].type).toBe(PARAMETER_TYPE.SOCKET_QUERY_PARAM);
    expect(parameters.handler[0].name).toBe("room");
    expect(parameters.handler[1].type).toBe(PARAMETER_TYPE.SOCKET_BODY);
    expect(parameters.handler[1].name).toBe("default");
    expect(parameters.handler[2].type).toBe(PARAMETER_TYPE.CONNECTED_SOCKET);
  });

  it("supports every parameter kind", () => {
    class Target {
      handler() {}
    }

    socketIO()(Target.prototype, "handler", 0);
    socketID()(Target.prototype, "handler", 1);
    socketRooms()(Target.prototype, "handler", 2);
    socketRequest()(Target.prototype, "handler", 3);

    const parameters = Reflect.getMetadata(
      METADATA_KEY.Parameter,
      Target,
    ) as Record<
      string,
      Array<{ index: number; type: PARAMETER_TYPE }>
    >;

    expect(parameters.handler.map((p) => p.type)).toEqual([
      PARAMETER_TYPE.SOCKET_REQUEST,
      PARAMETER_TYPE.SOCKET_ROOMS,
      PARAMETER_TYPE.SOCKET_ID,
      PARAMETER_TYPE.SOCKET_IO,
    ]);
  });
});

import "reflect-metadata";

import { Container, injectable } from "inversify";
import { describe, expect, it } from "bun:test";

import {
  ACTION_TYPE,
  METADATA_KEY,
  NO_CONTROLLERS_FOUND,
  TYPE,
} from "./constants";

import {
  getActionMetadata,
  getControllersFromContainer,
  getControllerMetadata,
  getParameterMetadata,
} from "./utils";

import type * as interfaces from "./interfaces";
import { controller, onMessage } from "./decorators";

describe("getControllersFromContainer", () => {
  it("returns bound controllers", () => {
    @injectable()
    @controller("/chat")
    class ChatController {}

    const container = new Container();
    container
      .bind<interfaces.Controller>(TYPE.Controller)
      .to(ChatController);

    const controllers = getControllersFromContainer(container, false);

    expect(controllers).toHaveLength(1);
    expect(controllers[0]).toBeInstanceOf(ChatController);
  });

  it("returns an empty list when nothing is bound and force is off", () => {
    const container = new Container();

    expect(getControllersFromContainer(container, false)).toEqual([]);
  });

  it("throws when nothing is bound and force is on", () => {
    const container = new Container();

    expect(() => getControllersFromContainer(container, true)).toThrow(
      NO_CONTROLLERS_FOUND,
    );
  });
});

describe("metadata getters", () => {
  it("returns undefined for an undecorated class", () => {
    class Plain {}

    expect(getControllerMetadata(Plain)).toBeUndefined();
    expect(getActionMetadata(Plain)).toBeUndefined();
    expect(getParameterMetadata(Plain)).toBeUndefined();
  });

  it("returns controller and action metadata for a decorated class", () => {
    @injectable()
    @controller("/chat")
    class ChatController {
      message() {}
    }

    onMessage("message")(ChatController.prototype, "message");
    Reflect.defineMetadata(
      METADATA_KEY.Parameter,
      { message: [{ index: 0, name: "default", type: 1 }] },
      ChatController,
    );

    expect(getControllerMetadata(ChatController)?.namespace).toBe("/chat");
    expect(getActionMetadata(ChatController)).toEqual([
      {
        key: "message",
        name: "message",
        target: ChatController.prototype,
        type: ACTION_TYPE.MESSAGE,
      },
    ]);
    expect(getParameterMetadata(ChatController)?.message).toHaveLength(1);
  });
});

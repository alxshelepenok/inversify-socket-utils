import "reflect-metadata";

import * as inversify from "inversify";
import * as SocketIO from "socket.io";

import { ACTION_TYPE, PARAMETER_TYPE, TYPE } from "./constants";
import * as interfaces from "./interfaces";
import {
  getActionMetadata,
  getControllerMetadata,
  getControllersFromContainer,
  getParameterMetadata,
} from "./utils";

export class InversifySocketServer {
  public server: SocketIO.Server;

  private readonly container: inversify.Container;

  constructor(container: inversify.Container, server: SocketIO.Server) {
    this.container = container;
    this.server = server;
  }

  public build(): SocketIO.Server {
    this.registerControllers();

    return this.server;
  }

  private registerControllers() {
    const controllers = getControllersFromContainer(this.container, false);

    controllers.forEach((controller: interfaces.Controller) => {
      const controllerMetadata = getControllerMetadata(controller.constructor);
      const actionMetadata = getActionMetadata(controller.constructor);
      const parameterMetadata = getParameterMetadata(controller.constructor);

      if (controllerMetadata && actionMetadata) {
        this.server
          .of(controllerMetadata.namespace)
          .on("connection", (socket) => {
            this.handleConnection(
              socket,
              controllerMetadata,
              actionMetadata,
              parameterMetadata,
            );
          });
      }
    });
  }

  private handleConnection(
    socket: SocketIO.Socket,
    controllerMetadata: interfaces.ControllerMetadata,
    actionMetadata: Array<interfaces.ControllerActionMetadata>,
    parameterMetadata: interfaces.ControllerParameterMetadata,
  ) {
    actionMetadata.forEach((metadata: interfaces.ControllerActionMetadata) => {
      if (metadata.type === ACTION_TYPE.CONNECT) {
        this.handleAction(
          socket,
          controllerMetadata,
          metadata,
          parameterMetadata,
        );
      }

      if (metadata.type === ACTION_TYPE.DISCONNECT) {
        socket.on("disconnect", () => {
          this.handleAction(
            socket,
            controllerMetadata,
            metadata,
            parameterMetadata,
          );
        });
      }

      if (metadata.type === ACTION_TYPE.MESSAGE) {
        socket.on(metadata.name, (...payload) => {
          this.handleAction(
            socket,
            controllerMetadata,
            metadata,
            parameterMetadata,
            payload,
          );
        });
      }
    });
  }

  private handleAction(
    socket: SocketIO.Socket,
    controller: interfaces.ControllerMetadata,
    action: interfaces.ControllerActionMetadata,
    parameters: interfaces.ControllerParameterMetadata,
    payload: unknown[],
  ) {
    let paramList: interfaces.ParameterMetadata[] = [];
    if (parameters) {
      paramList = parameters[action.key] || [];
    }
      
    const cb = (typeof payload[payload.length-1] == "function") ? payload.splice(-1,1)[0] : undefined;

    const args = this.extractParams(socket, payload, paramList, cb);
    const result = (
      this.container.getNamed<interfaces.Controller>(
        TYPE.Controller,
        (controller.target as { name: string }).name,
      ) as Record<string, (...a: Array<unknown>) => unknown>
    )[action.key](...args);
    if(cb) cb(result);
  }

  private extractParams(
    socket: SocketIO.Socket,
    payload: unknown,
    params: Array<interfaces.ParameterMetadata>,
    cb: function
  ) {
    const args: Array<unknown> = [];

    params.forEach(({ type, index, name }) => {
      switch (type) {
        case PARAMETER_TYPE.CONNECTED_SOCKET:
          args[index] = socket;
          return;
        case PARAMETER_TYPE.SOCKET_IO:
          args[index] = this.server;
          return;
        case PARAMETER_TYPE.SOCKET_QUERY_PARAM:
          args[index] = socket.handshake.query[name];
          return;
        case PARAMETER_TYPE.SOCKET_ID:
          args[index] = socket.id;
          return;
        case PARAMETER_TYPE.SOCKET_REQUEST:
          args[index] = socket.request;
          return;
        case PARAMETER_TYPE.SOCKET_ROOMS:
          args[index] = socket.rooms;
          return;
        case PARAMETER_TYPE.SOCKET_BODY:
          args[index] = payload;
          return;
        case PARAMETER_TYPE.SOCKET_CALLBACK:
          args[index] = cb;
          return;
        default:
          args[index] = undefined;
      }
    });

    return args;
  }
}

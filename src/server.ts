import "reflect-metadata";
import * as inversify from "inversify";
import { Interfaces } from "./interfaces";
import { TYPE, ACTION_TYPE, PARAMETER_TYPE } from "./constants";
import { getControllerMetadata, getActionMetadata, getParameterMetadata, getControllersFromContainer } from "./utils";
import { Controller } from "./decorators";
import * as SocketIO from "socket.io";

export class InversifySocketServer {
    public server: SocketIO.Server;
    private container: inversify.Container;

    constructor(container: inversify.Container, server: SocketIO.Server) {
        this.container = container;
        this.server = server;
    }

    public build(): SocketIO.Server {
        this.registerControllers();

        return this.server;
    }

    private registerControllers() {
        let controllers = getControllersFromContainer(this.container, false);

        controllers.forEach((controller: Interfaces.Controller) => {
            let controllerMetadata = getControllerMetadata(controller.constructor);
            let actionMetadata = getActionMetadata(controller.constructor);
            let parameterMetadata = getParameterMetadata(controller.constructor);

             if (controllerMetadata && actionMetadata) {
                 this.server.of(controllerMetadata.namespace).on("connection", (socket: any) => {
                    this.handleConnection(socket, controllerMetadata, actionMetadata, parameterMetadata);
                });
             }
        });
    }

    private handleConnection(socket: any, controllerMetadata: Interfaces.ControllerMetadata,
        actionMetadata: Interfaces.ControllerActionMetadata[], parameterMetadata: Interfaces.ControllerParameterMetadata) {
        actionMetadata.forEach((metadata: Interfaces.ControllerActionMetadata) => {
            switch (metadata.type) {
                case ACTION_TYPE.CONNECT:
                    this.handleAction(socket, controllerMetadata, metadata, parameterMetadata);
                    break;
                case ACTION_TYPE.DISCONNECT:
                    socket.on("disconnect", () => {
                        this.handleAction(socket, controllerMetadata, metadata, parameterMetadata);
                    });
                    break;
                case ACTION_TYPE.MESSAGE:
                    socket.on(metadata.name, (payload: any) => {
                        this.handleAction(socket, controllerMetadata, metadata, parameterMetadata, payload);
                    });
                    break;
            }
        });
    }

    private handleAction(socket: any, controller: Interfaces.ControllerMetadata, action: Interfaces.ControllerActionMetadata,
        parameters: Interfaces.ControllerParameterMetadata, payload?: any) {
        let paramList: Interfaces.ParameterMetadata[] = [];
        if (parameters) {
            paramList = parameters[action.key] || [];
        }

        let args = this.extractParams(socket, payload, paramList);
        (this.container.getNamed(TYPE.Controller, controller.target.name) as any)[action.key](...args);
    }

    private extractParams(socket: any, payload: any, params: Interfaces.ParameterMetadata[]): any[] {
        let args: any[] = [];

        params.forEach(({type, index, name}) => {
            switch (type) {
                case PARAMETER_TYPE.CONNECTED_SOCKET:
                    args[index] = socket;
                    break;
                case PARAMETER_TYPE.SOCKET_IO:
                    args[index] = this.server;
                    break;
                case PARAMETER_TYPE.SOCKET_QUERY_PARAM:
                    args[index] = socket.handshake.query[name];
                    break;
                case PARAMETER_TYPE.SOCKET_ID:
                    args[index] = socket.id;
                    break;
                case PARAMETER_TYPE.SOCKET_REQUEST:
                    args[index] = socket.request;
                    break;
                case PARAMETER_TYPE.SOCKET_ROOMS:
                    args[index] = socket.rooms;
                    break;
                default:
                    args[index] = payload;
                    break;
            }
        });

        return args;
    }
}

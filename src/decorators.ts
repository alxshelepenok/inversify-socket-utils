import "reflect-metadata";
import { inject, injectable, decorate } from "inversify";
import { METADATA_KEY, TYPE, ACTION_TYPE, PARAMETER_TYPE } from "./constants";
import { Interfaces } from "./interfaces";

export function Controller(namespace: string) {
  return function (target: any) {
    const currentMetadata: Interfaces.ControllerMetadata = {
      namespace: namespace,
      target: target
    };

    Reflect.defineMetadata(METADATA_KEY.Controller, currentMetadata, target);

    const previousMetadata: Interfaces.ControllerMetadata[] = Reflect.getMetadata(
      METADATA_KEY.Controller,
      Reflect
    ) || [];

    const newMetadata = [currentMetadata, ...previousMetadata];

    Reflect.defineMetadata(
      METADATA_KEY.Controller,
      newMetadata,
      Reflect
    );
  };
}

export function OnConnect(name: string): Interfaces.ActionDecorator {
  return function (target: any, key: string) {
    const metadata: Interfaces.ControllerActionMetadata = {
      key: key,
      name: name,
      type: ACTION_TYPE.CONNECT,
      target: target
    };

    let metadataList: Interfaces.ControllerActionMetadata[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.Action, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.Action, target.constructor);
    }

    metadataList.push(metadata);
  };
}

export function OnDisconnect(name: string): Interfaces.ActionDecorator {
  return function (target: any, key: string) {
    const metadata: Interfaces.ControllerActionMetadata = {
      key: key,
      name: name,
      type: ACTION_TYPE.DISCONNECT,
      target: target
    };

    let metadataList: Interfaces.ControllerActionMetadata[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.Action, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.Action, target.constructor);
    }

    metadataList.push(metadata);
  };
}

export function OnMessage(name: string): Interfaces.ActionDecorator {
  return function (target: any, key: string) {
    const metadata: Interfaces.ControllerActionMetadata = {
      key: key,
      name: name,
      type: ACTION_TYPE.MESSAGE,
      target: target
    };

    let metadataList: Interfaces.ControllerActionMetadata[] = [];

    if (!Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      Reflect.defineMetadata(METADATA_KEY.Action, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.Action, target.constructor);
    }

    metadataList.push(metadata);
  };
}

export const SocketIO: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_IO);
export const SocketID: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_ID);
export const ConnectedSocket: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.CONNECTED_SOCKET);
export const Payload: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_BODY);
export const SocketQueryParam: (name: string) => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_QUERY_PARAM);
export const SocketRequest: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_REQUEST);
export const SocketRooms: () => ParameterDecorator = paramDecoratorFactory(PARAMETER_TYPE.SOCKET_ROOMS);

function paramDecoratorFactory(parameterType: PARAMETER_TYPE): (name?: string) => ParameterDecorator {
  return function (name?: string): ParameterDecorator {
    name = name || "default";
    return params(parameterType, name);
  };
}

export function params(type: PARAMETER_TYPE, name: string) {
  return function (target: Object, methodName: string, index: number) {
    let metadataList: Interfaces.ControllerParameterMetadata = {};
    let parameterMetadataList: Interfaces.ParameterMetadata[] = [];
    const parameterMetadata: Interfaces.ParameterMetadata = {
      index: index,
      name: name,
      type: type
    };

    if (!Reflect.hasMetadata(METADATA_KEY.Parameter, target.constructor)) {
      parameterMetadataList.unshift(parameterMetadata);
    } else {
      metadataList = Reflect.getMetadata(METADATA_KEY.Parameter, target.constructor);
      if (metadataList.hasOwnProperty(methodName)) {
        parameterMetadataList = metadataList[methodName];
      }
      parameterMetadataList.unshift(parameterMetadata);
    }

    metadataList[methodName] = parameterMetadataList;
    Reflect.defineMetadata(METADATA_KEY.Parameter, metadataList, target.constructor);
  };
}

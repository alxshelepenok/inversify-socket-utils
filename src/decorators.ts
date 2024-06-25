import "reflect-metadata";

import { ACTION_TYPE, METADATA_KEY, PARAMETER_TYPE } from "./constants";
import * as interfaces from "./interfaces";

export const controller =
  (namespace: string) =>
  (target: NewableFunction): void => {
    const currentMetadata: interfaces.ControllerMetadata = {
      namespace,
      target,
    };

    Reflect.defineMetadata(METADATA_KEY.Controller, currentMetadata, target);

    const previousMetadata: Array<interfaces.ControllerMetadata> =
      Reflect.getMetadata(METADATA_KEY.Controller, Reflect) || [];

    const newMetadata = [currentMetadata, ...previousMetadata];

    Reflect.defineMetadata(METADATA_KEY.Controller, newMetadata, Reflect);
  };

export const onConnect =
  (name: string): interfaces.ActionDecorator =>
  (target: interfaces.DecoratorTarget, key: string): void => {
    const metadata: interfaces.ControllerActionMetadata = {
      key,
      name,
      target,
      type: ACTION_TYPE.CONNECT,
    };

    let metadataList: interfaces.ControllerActionMetadata[] = [];

    if (Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.Action,
        target.constructor,
      );
    } else {
      Reflect.defineMetadata(
        METADATA_KEY.Action,
        metadataList,
        target.constructor,
      );
    }

    metadataList.push(metadata);
  };

export const onDisconnect =
  (name: string): interfaces.ActionDecorator =>
  (target: interfaces.DecoratorTarget, key: string) => {
    const metadata: interfaces.ControllerActionMetadata = {
      key,
      name,
      target,
      type: ACTION_TYPE.DISCONNECT,
    };

    let metadataList: interfaces.ControllerActionMetadata[] = [];

    if (Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.Action,
        target.constructor,
      );
    } else {
      Reflect.defineMetadata(
        METADATA_KEY.Action,
        metadataList,
        target.constructor,
      );
    }

    metadataList.push(metadata);
  };

export const onMessage =
  (name: string): interfaces.ActionDecorator =>
  (target: interfaces.DecoratorTarget, key: string) => {
    const metadata: interfaces.ControllerActionMetadata = {
      key,
      name,
      target,
      type: ACTION_TYPE.MESSAGE,
    };

    let metadataList: interfaces.ControllerActionMetadata[] = [];

    if (Reflect.hasMetadata(METADATA_KEY.Action, target.constructor)) {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.Action,
        target.constructor,
      );
    } else {
      Reflect.defineMetadata(
        METADATA_KEY.Action,
        metadataList,
        target.constructor,
      );
    }

    metadataList.push(metadata);
  };

export const params =
  (type: PARAMETER_TYPE, name: string) =>
  (
    target: unknown | interfaces.Controller,
    methodName: string | symbol,
    index: number,
  ) => {
    let metadataList: interfaces.ControllerParameterMetadata = {};
    let parameterMetadataList: interfaces.ParameterMetadata[] = [];
    const parameterMetadata: interfaces.ParameterMetadata = {
      index: index,
      name: name,
      type: type,
    };

    if (
      Reflect.hasMetadata(
        METADATA_KEY.Parameter,
        (target as interfaces.Controller).constructor,
      )
    ) {
      metadataList = Reflect.getMetadata(
        METADATA_KEY.Parameter,
        (target as interfaces.Controller).constructor,
      );
      if (Object.prototype.hasOwnProperty.call(metadataList, methodName)) {
        parameterMetadataList = metadataList[methodName as string];
      }
      parameterMetadataList.unshift(parameterMetadata);
    } else {
      parameterMetadataList.unshift(parameterMetadata);
    }

    metadataList[methodName as string] = parameterMetadataList;
    Reflect.defineMetadata(
      METADATA_KEY.Parameter,
      metadataList,
      (target as interfaces.Controller).constructor,
    );
  };

const paramDecoratorFactory =
  (parameterType: PARAMETER_TYPE): ((name?: string) => ParameterDecorator) =>
  (name?: string): ParameterDecorator =>
    params(parameterType, name || "default");

export const socketIO: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_IO,
);

export const socketID: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_ID,
);

export const connectedSocket: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.CONNECTED_SOCKET,
);

export const payload: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_BODY,
);
export const messageCallback: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_CALLBACK,
);

export const socketQueryParam: (name: string) => ParameterDecorator =
  paramDecoratorFactory(PARAMETER_TYPE.SOCKET_QUERY_PARAM);

export const socketRequest: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_REQUEST,
);

export const socketRooms: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_ROOMS,
);

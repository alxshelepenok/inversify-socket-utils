import "reflect-metadata";

import * as interfaces from "./interfaces";
import { ACTION_TYPE, METADATA_KEY, PARAMETER_TYPE } from "./constants";

export const controller =
  (namespace: string) =>
  (target: NewableFunction): void => {
    Reflect.defineMetadata(
      METADATA_KEY.Controller,
      { namespace, target },
      target,
    );

    const previousMetadata: interfaces.ControllerMetadata[] =
      Reflect.getMetadata(METADATA_KEY.Controller, Reflect) ?? [];

    Reflect.defineMetadata(
      METADATA_KEY.Controller,
      [{ namespace, target }, ...previousMetadata],
      Reflect,
    );
  };

const defineActionMetadata =
  (type: ACTION_TYPE) =>
  (name: string): interfaces.ActionDecorator =>
  (target: interfaces.DecoratorTarget, key: string): void => {
    const previousMetadata: interfaces.ControllerActionMetadata[] =
      Reflect.getMetadata(METADATA_KEY.Action, target.constructor) ?? [];

    Reflect.defineMetadata(
      METADATA_KEY.Action,
      [...previousMetadata, { key, name, target, type }],
      target.constructor,
    );
  };

export const onConnect: (name: string) => interfaces.ActionDecorator =
  defineActionMetadata(ACTION_TYPE.CONNECT);

export const onDisconnect: (name: string) => interfaces.ActionDecorator =
  defineActionMetadata(ACTION_TYPE.DISCONNECT);

export const onMessage: (name: string) => interfaces.ActionDecorator =
  defineActionMetadata(ACTION_TYPE.MESSAGE);

export const params =
  (type: PARAMETER_TYPE, name: string): ParameterDecorator =>
  (target, methodName, index) => {
    const { constructor } = target as { constructor: NewableFunction };

    const metadataList: interfaces.ControllerParameterMetadata =
      Reflect.getMetadata(METADATA_KEY.Parameter, constructor) ?? {};
    const previousMetadata: interfaces.ParameterMetadata[] =
      metadataList[methodName as string] ?? [];

    metadataList[methodName as string] = [
      { index, name, type },
      ...previousMetadata,
    ];

    Reflect.defineMetadata(METADATA_KEY.Parameter, metadataList, constructor);
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

export const socketQueryParam: (name: string) => ParameterDecorator =
  paramDecoratorFactory(PARAMETER_TYPE.SOCKET_QUERY_PARAM);

export const socketRequest: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_REQUEST,
);

export const socketRooms: () => ParameterDecorator = paramDecoratorFactory(
  PARAMETER_TYPE.SOCKET_ROOMS,
);

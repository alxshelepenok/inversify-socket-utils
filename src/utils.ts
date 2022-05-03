import "reflect-metadata";

import { interfaces as inversifyInterfaces } from "inversify";

import { METADATA_KEY, NO_CONTROLLERS_FOUND, TYPE } from "./constants";
import * as interfaces from "./interfaces";

export const getControllersFromContainer = (
  container: inversifyInterfaces.Container,
  forceControllers: boolean,
) => {
  if (container.isBound(TYPE.Controller)) {
    return container.getAll<interfaces.Controller>(TYPE.Controller);
  } else if (forceControllers) {
    throw new Error(NO_CONTROLLERS_FOUND);
  } else {
    return [];
  }
};

export const getControllerMetadata = (constructor: Object) => {
  const controllerMetadata: interfaces.ControllerMetadata = Reflect.getMetadata(
    METADATA_KEY.Controller,
    constructor,
  );

  return controllerMetadata;
};

export const getActionMetadata = (constructor: Object) => {
  const actionMetadata: interfaces.ControllerActionMetadata[] =
    Reflect.getMetadata(METADATA_KEY.Action, constructor);

  return actionMetadata;
};

export const getParameterMetadata = (constructor: Object) => {
  const parameterMetadata: interfaces.ControllerParameterMetadata =
    Reflect.getMetadata(METADATA_KEY.Parameter, constructor);

  return parameterMetadata;
};

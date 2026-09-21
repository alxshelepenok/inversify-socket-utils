import { ACTION_TYPE, PARAMETER_TYPE } from "./constants";

export type Controller = object;

interface ConstructorFunction<T = Record<string, unknown>> {
  new (...args: Array<unknown>): T;
}

export type DecoratorTarget<T = unknown> =
  | ConstructorFunction<T>
  | object;

export interface ActionDecorator {
  (target: DecoratorTarget, key: string): void;
}

export interface ControllerMetadata {
  namespace: string;
  target: DecoratorTarget;
}

export interface ControllerActionMetadata {
  key: string;
  name: string;
  type: ACTION_TYPE;
  target: DecoratorTarget;
}

export interface ParameterMetadata {
  name: string;
  index: number;
  type: PARAMETER_TYPE;
}

export interface ControllerParameterMetadata {
  [methodName: string]: ParameterMetadata[];
}

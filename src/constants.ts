export const TYPE = {
  Controller: Symbol.for("Controller")
};

export const METADATA_KEY = {
  Controller: "inversify-socket-utils:controller",
  Action: "inversify-socket-utils:controller-action",
  Parameter: "inversify-socket-utils:controller-parameter"
};

export enum ACTION_TYPE {
  MESSAGE,
  CONNECT,
  DISCONNECT
}

export enum PARAMETER_TYPE {
  CONNECTED_SOCKET,
  SOCKET_BODY,
  SOCKET_QUERY_PARAM,
  SOCKET_IO,
  SOCKET_ID,
  SOCKET_REQUEST,
  SOCKET_ROOMS
}

export const DUPLICATED_CONTROLLER_NAME = (name: string) =>
  `Two controllers cannot have the same name: ${name}`;

export const NO_CONTROLLERS_FOUND = "No controllers have been found! " +
  "Please ensure that you have register at least one Controller.";

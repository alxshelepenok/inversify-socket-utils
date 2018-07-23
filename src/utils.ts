import "reflect-metadata";
import { interfaces as inversifyInterfaces } from "inversify";
import { METADATA_KEY, NO_CONTROLLERS_FOUND } from "./constants";
import { Interfaces } from "./interfaces";
import { TYPE } from "./constants";

export function getControllersFromContainer(
    container: inversifyInterfaces.Container,
    forceControllers: boolean
) {
    if (container.isBound(TYPE.Controller)) {
        return container.getAll<Interfaces.Controller>(TYPE.Controller);
    } else if (forceControllers) {
        throw new Error(NO_CONTROLLERS_FOUND);
    } else {
        return [];
    }
}

export function getControllersFromMetadata() {
    let arrayOfControllerMetadata: Interfaces.ControllerMetadata[] = Reflect.getMetadata(
        METADATA_KEY.Controller,
        Reflect
    ) || [];
    return arrayOfControllerMetadata.map((metadata) => metadata.target);
}

export function getControllerMetadata(constructor: any) {
    let controllerMetadata: Interfaces.ControllerMetadata = Reflect.getMetadata(
        METADATA_KEY.Controller,
        constructor
    );
    return controllerMetadata;
}

export function getActionMetadata(constructor: any) {
    let actionMetadata: Interfaces.ControllerActionMetadata[] = Reflect.getMetadata(
        METADATA_KEY.Action,
        constructor
    );
    return actionMetadata;
}

export function getParameterMetadata(constructor: any) {
    let parameterMetadata: Interfaces.ControllerParameterMetadata = Reflect.getMetadata(
        METADATA_KEY.Parameter,
        constructor
    );
    return parameterMetadata;
}

export function cleanUpMetadata() {
    Reflect.defineMetadata(
        METADATA_KEY.Controller,
        [],
        Reflect
    );
}

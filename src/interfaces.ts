import { ACTION_TYPE, PARAMETER_TYPE } from "./constants";

namespace Interfaces {
    export interface Instance {}

    export interface Controller {}

    export interface ActionDecorator {
        (target: any, key: string): void;
    }

     export interface ControllerMetadata {
        namespace: string;
        target: any;
    }

    export interface ControllerActionMetadata {
        key: string;
        name: string;
        type: ACTION_TYPE;
        target: any;
    }

    export interface ControllerParameterMetadata {
        [methodName: string]: ParameterMetadata[];
    }

    export interface ParameterMetadata {
        name: string;
        index: number;
        type: PARAMETER_TYPE;
    }
}

export { Interfaces };

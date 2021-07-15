/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
import { Validation } from "../Validation";

export const CONTROLLER_METADATA = "controller_metadata";
export const ROUTE_METADATA = "method_metadata";
export const PARAM_METADATA = "param_metadata";

export function Controller (path = ""): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, path, target);
  };
}

export function createMethodDecorator (method: string = "get") {
  return (path: string | symbol = "/"): MethodDecorator => (
    target: object,
    name: string | symbol,
    descriptor: any
  ) => {
    Reflect.defineMetadata(
      ROUTE_METADATA,
      { type: method, path },
      descriptor.value
    );
  };
}

export const Get = createMethodDecorator("get");
export const Post = createMethodDecorator("post");
export const Ws = createMethodDecorator("ws");

export type Param =
  | "params"
  | "query"
  | "body"
  | "headers"
  | "cookies"
  | "uploadFile";

export interface ParamType {
  key: string;
  index: number;
  type: string;
  validator?: Validation;
  paramType?: any;
}

export function createParamDecorator (type: Param) {
  return (key?: any, validator?: any): ParameterDecorator => (
    target: any,
    name: string | symbol,
    index: number
  ) => {
    const paramsTypes = Reflect.getMetadata("design:paramtypes", target, name);
    // 这里要注意这里 defineMetadata 挂在 target.name 上
    // 但该函数的参数有顺序之分，下一个装饰器定义参数后覆盖之前的，所以要用 preMetadata 保存起来
    const preMetadata = Reflect.getMetadata(PARAM_METADATA, target, name) || [];

    const newMetadata = [
      {
        key,
        index,
        type,
        validator,
        paramType: paramsTypes[index],
      },
      ...preMetadata,
    ];

    Reflect.defineMetadata(PARAM_METADATA, newMetadata, target, name);
  };
}

// export const Headers = createParamDecorator("headers");

export function Query(): ParameterDecorator;
export function Query(property: string): ParameterDecorator;
export function Query(validator: Validation): ParameterDecorator;
export function Query(
  property: string,
  validator: Validation
): ParameterDecorator;
export function Query (property?: string | Validation, validator?: Validation) {
  const hasParamData = property && typeof property === "string";
  const key = hasParamData ? property : undefined;
  const vail = hasParamData ? validator : property;
  return createParamDecorator("query")(key, vail);
}

export function Body(): ParameterDecorator;
export function Body(property: string): ParameterDecorator;
export function Body(validator: Validation): ParameterDecorator;
export function Body(
  property: string,
  validator: Validation
): ParameterDecorator;
export function Body (property?: string | Validation, validator?: Validation) {
  const hasParamData = property && typeof property === "string";
  const key = hasParamData ? property : undefined;
  const vail = hasParamData ? validator : property;
  return createParamDecorator("body")(key, vail);
}

export function Headers(): ParameterDecorator;
export function Headers(property: string): ParameterDecorator;
export function Headers(validator: Validation): ParameterDecorator;
export function Headers(
  property: string,
  validator: Validation
): ParameterDecorator;
export function Headers (
  property?: string | Validation,
  validator?: Validation
) {
  const hasParamData = property && typeof property === "string";
  const key = hasParamData ? property : undefined;
  const vail = hasParamData ? validator : property;
  return createParamDecorator("headers")(key, vail);
}

export function UploadedFile () {
  return createParamDecorator("uploadFile")();
}

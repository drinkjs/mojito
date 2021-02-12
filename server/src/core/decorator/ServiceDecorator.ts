import { ReturnModelType } from "@typegoose/typegoose";
import { Repository } from "typeorm";
import { Constructor } from "./IocDecorator";
import Ormer from "../../common/Ormer";
import Mongoer from "../../common/Mongoer";
import WebsocketEmitter from "../WebsocketEmitter";

export const ORM_MODEL_METADATA = "orm_model_metadata";
export const MG_MODEL_METADATA = "mg_model_metadata";
export const WSS_METADATA = "wss_metadata";

export function MgModel (
  value: Constructor,
  connectName?: string
): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata = Reflect.getMetadata(MG_MODEL_METADATA, Mongoer) || [];
    const newMetadata = [{ key, target, value, connectName }, ...preMetadata];
    Reflect.defineMetadata(MG_MODEL_METADATA, newMetadata, Mongoer);
  };
}

export function OrmModel (
  value: Constructor,
  connectName?: string
): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata = Reflect.getMetadata(ORM_MODEL_METADATA, Ormer) || [];
    const newMetadata = [{ key, target, value, connectName }, ...preMetadata];
    Reflect.defineMetadata(ORM_MODEL_METADATA, newMetadata, Ormer);
  };
}

export function WebSocketServer (): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata =
      Reflect.getMetadata(WSS_METADATA, WebsocketEmitter) || [];
    const newMetadata = [{ key, target }, ...preMetadata];
    Reflect.defineMetadata(WSS_METADATA, newMetadata, WebsocketEmitter);
  };
}

export type MgModelType<T> = ReturnModelType<Constructor<T>>;
export type OrmModelType<T> = Repository<T>;

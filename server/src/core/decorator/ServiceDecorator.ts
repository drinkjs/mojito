import { ReturnModelType } from "@typegoose/typegoose";
import { ConnectionOptions, Repository } from "typeorm";
import { Constructor } from "./IocDecorator";
import Ormer from "../../common/Ormer";
import Mongoer, { MongoConnectionOptions } from "../../common/Mongoer";
import Rediser from "../../common/Rediser";

import WebsocketEmitter from "../WebsocketEmitter";
import IORedis from "ioredis";

export const ORM_MODEL_METADATA = "orm_model_metadata";
export const MG_MODEL_METADATA = "mg_model_metadata";
export const CACHE_MODEL_METADATA = "cache_manager_metadata";
export const WSS_METADATA = "wss_metadata";

export function MgModel (
  model: Constructor,
  options?: MongoConnectionOptions
): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata = Reflect.getMetadata(MG_MODEL_METADATA, Mongoer) || [];
    const newMetadata = [{ key, target, model, options }, ...preMetadata];
    Reflect.defineMetadata(MG_MODEL_METADATA, newMetadata, Mongoer);
  };
}

export function OrmModel (
  entity: Constructor,
  options?: ConnectionOptions
): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata = Reflect.getMetadata(ORM_MODEL_METADATA, Ormer) || [];
    const newMetadata = [{ key, target, entity, options }, ...preMetadata];
    Reflect.defineMetadata(ORM_MODEL_METADATA, newMetadata, Ormer);
  };
}

export function RedisModel (options?: IORedis.RedisOptions): PropertyDecorator {
  return (target: any, key: any) => {
    const preMetadata =
      Reflect.getMetadata(CACHE_MODEL_METADATA, Rediser) || [];
    const newMetadata = [{ key, target, options }, ...preMetadata];
    Reflect.defineMetadata(CACHE_MODEL_METADATA, newMetadata, Rediser);
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

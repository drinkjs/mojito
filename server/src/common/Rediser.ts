import { CACHE_MODEL_METADATA } from "../core/decorator";
import IORedis from "ioredis";
import { defaultConfig } from "../config";

// sudo service redis-server restart

export default class Rediser {
  static instance: Rediser;

  static getInstance () {
    if (!Rediser.instance) {
      Rediser.instance = new Rediser();
    }
    return Rediser.instance;
  }

  private redisConnects: IORedis.Redis[] = [];

  async addConnect (opts: IORedis.RedisOptions) {
    const redis = new IORedis(opts);
    return new Promise((resolve, reject) => {
      redis.once("connect", () => {
        console.log(`redis@${opts?.host}:${opts?.port} connected`.green);
        this.redisConnects.push(redis);
        resolve(redis);
      });
      redis.on("error", (err) => {
        throw err;
      });
    });
  }

  async inject () {
    const services: any[] = Reflect.getMetadata(CACHE_MODEL_METADATA, Rediser);
    if (services) {
      for (const service of services) {
        const { key, target, options } = service;
        const opts: IORedis.RedisOptions = options || defaultConfig.redis;
        target[key] =
          this.redisConnects.find((v) => v.connect.name === opts.name) ||
          (await this.addConnect(opts));
      }
    }
  }

  // getRedis () {
  //   return this.redis;
  // }

  // async get<T> (key: string): Promise<T | null> {
  //   const rel = await this.redis.get(key);
  //   if (rel) {
  //     const obj: T = JSON.parse(rel);
  //     return obj;
  //   }
  //   return null;
  // }

  // async getString (key: string): Promise<string | null> {
  //   return await this.redis.get(key);
  // }

  // async set (key: string, value: any, time?: number) {
  //   const val = typeof value === "object" ? JSON.stringify(value) : value;
  //   const rel = time
  //     ? await this.redis.set(key, val, "EX", time)
  //     : await this.redis.set(key, val);
  //   return rel === "OK";
  // }

  // async del (key: string) {
  //   return await this.redis.del(key);
  // }
}

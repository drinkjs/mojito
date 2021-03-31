import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import controllers from "../controller";
import AppError from "../common/AppError";
import { IocFactory } from "./decorator/IocDecorator";
import {
  CONTROLLER_METADATA,
  PARAM_METADATA,
  ROUTE_METADATA,
  ParamType,
} from "./decorator/RouterDecorator";
import WebsocketEmitter from "./WebsocketEmitter";

function selfish (target: any) {
  const cache = new WeakMap();
  const handler = {
    get (self: any, key: any) {
      const value = Reflect.get(self, key);
      if (typeof value !== "function") {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(self));
      }
      return cache.get(value);
    },
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}
export default class Router {
  private server: FastifyInstance;

  private wss: WebsocketEmitter | undefined;

  private exceptionFilter: ExceptionFilter | undefined;

  static instance: Router;

  static getInstance (app: FastifyInstance, websocketFlag?: boolean) {
    if (!Router.instance) {
      Router.instance = new Router(app, websocketFlag);
    }
    return Router.instance;
  }

  constructor (server: FastifyInstance, websocketFlag?: boolean) {
    this.server = server;

    if (websocketFlag) {
      this.wss = new WebsocketEmitter();
    }

    // ioc方式生成controller
    controllers.forEach((controller) => {
      const instance = IocFactory(controller);
      const controllerMetadata: string = Reflect.getMetadata(
        CONTROLLER_METADATA,
        controller
      );
      const proto = Object.getPrototypeOf(instance);
      // 拿到该实例的原型方法
      const routeNameArr = Object.getOwnPropertyNames(proto).filter(
        (n) => n !== "constructor" && typeof proto[n] === "function"
      );

      routeNameArr.forEach((routeName) => {
        const routeMetadata: any = Reflect.getMetadata(
          ROUTE_METADATA,
          proto[routeName]
        );
        if (!routeMetadata) return;

        const { type, path } = routeMetadata;
        const self = selfish(instance);
        const urlPath =
          typeof path === "string" ? controllerMetadata + path : path;
        // webaocket事件
        if (this.wss && type === "ws") {
          this.wss.on(urlPath, self[routeName]);
          return;
        }

        const handler = this.handlerFactory(
          self[routeName],
          Reflect.getMetadata(PARAM_METADATA, instance, routeName)
        );
        // 绑定路由
        this.server.route({
          method: type.toUpperCase(),
          url: urlPath,
          // onRequest: this.server.csrfProtection,
          handler,
        });
        console.info(`Add {${urlPath}, ${type.toUpperCase()}} route`.blue);
      });
    });

    if (this.wss) {
      this.wss.listen({ server: server.server });
    }
  }

  useExceptionFilter (filter: ExceptionFilter) {
    this.exceptionFilter = filter;
  }

  /**
   * 生成路由处理方法
   * @param func
   * @param paramList
   */
  // eslint-disable-next-line no-unused-vars
  handlerFactory (func: (...args: any[]) => any, paramList: any[]) {
    return async (req: FastifyRequest, res: FastifyReply) => {
      const ctx: RouterContext = { req, res };
      try {
        // 获取路由函数的参数
        const args = await this.extractParameters(ctx, paramList);
        const rel = await func(...args);
        res.send(rel);
      } catch (e) {
        req.log.error(e);
        if (this.exceptionFilter) {
          this.exceptionFilter.catch(e, ctx);
        } else {
          res.send({
            code: 500,
            message: e,
          });
        }
      }
    };
  }

  async extractParameters (ctx: RouterContext, paramArr: ParamType[] = []) {
    if (!paramArr.length) return [ctx];
    const { req } = ctx;

    const args: any[] = [];
    const checkArgs: any[] = [];
    for (const param of paramArr) {
      const { key, index, type, validator, paramType } = param;
      let obj;
      switch (type) {
        case "query":
          obj = req.query as any;
          args[index] = key && obj ? obj[key] : obj;
          break;
        case "body":
          obj = req.body as any;
          args[index] = key && obj ? obj[key] : obj;
          break;
        case "headers":
          obj = req.headers as any;
          args[index] = key && obj ? obj[key] : obj;
          break;
        case "uploadFile":
          obj = req as any;
          // eslint-disable-next-line no-await-in-loop
          args[index] = await obj.file();
          break;
        default:
          args[index] = undefined;
      }

      if (validator) {
        // 验证参数
        // eslint-disable-next-line no-await-in-loop
        checkArgs[index] = await validator.check(paramType, args[index]);
      } else {
        if (key && (args[index] === undefined || args[index] === "")) {
          AppError.assert(`${key}不能为空`);
        }
        checkArgs[index] = args[index];
      }
    }

    checkArgs.push(ctx);
    return checkArgs;
  }
}

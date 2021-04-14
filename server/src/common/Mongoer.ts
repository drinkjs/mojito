import { getModelForClass } from "@typegoose/typegoose";
import { registerDecorator, ValidationOptions } from "class-validator";
import * as mongoose from "mongoose";
import { MG_MODEL_METADATA } from "../core/decorator/ServiceDecorator";

export default class Mongoer {
  static instance: Mongoer;

  static getInstance (uri: string, options?: any) {
    if (!Mongoer.instance) {
      Mongoer.instance = new Mongoer(uri, options);
    }
    return Mongoer.instance;
  }

  static getCurrInstance () {
    return Mongoer.instance;
  }

  private uri: string;

  private options: mongoose.ConnectionOptions | undefined;

  connected: boolean = false;

  constructor (uri: string, options?: mongoose.ConnectionOptions) {
    this.uri = uri;
    this.options = options;
    this.connect();
  }

  connect () {
    mongoose
      .connect(this.uri, this.options)
      .then(() => {
        // 连接成功
        console.log(`${this.uri} connected`.green);
        this.connected = true;
        const services: any[] = Reflect.getMetadata(MG_MODEL_METADATA, Mongoer);
        if (services) {
          services.forEach(({ key, target, value /* connectName, */ }) => {
            if (target[key]) {
              return;
            }
            target[key] = getModelForClass(value, {});
          });
        }
      })
      .catch((err) => {
        this.connected = false;
        console.log(err);
      });
  }
}

/**
 * 自定义验证objectId装饰器
 * @param property
 * @param validationOptions
 */
// export function IsObjectId (validationOptions?: ValidationOptions) {
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       target: object.constructor,
//       propertyName,
//       options: validationOptions,
//       constraints: [],
//       validator: {
//         validate (value: any) {
//           return mongoose.Types.ObjectId.isValid(value);
//         },
//       },
//     });
//   };
// }

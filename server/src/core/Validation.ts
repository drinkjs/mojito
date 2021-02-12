import {
  validateOrReject,
  ValidationError,
  ValidatorOptions,
} from "class-validator";
import { plainToClass } from "class-transformer";
import AppError from "common/AppError";

export interface ValidationOptions extends ValidatorOptions {
  // 转换类型
  expectedType?: any;
}
export class Validation {
  protected expectedType: any;

  protected validatorOptions: ValidationOptions | undefined;

  constructor (validatorOptions?: ValidationOptions) {
    this.expectedType = validatorOptions
      ? validatorOptions.expectedType
      : undefined;
    this.validatorOptions = validatorOptions;
  }

  async check (type: any, params: any): Promise<any> {
    const postData = this.transform(this.expectedType || type, params);
    await validateOrReject(postData, this.validatorOptions).catch(
      (err: ValidationError[]) => {
        if (err.length > 0 && err[0].constraints) {
          const keys = Object.keys(err[0].constraints);
          AppError.assert(err[0].constraints[keys[0]]);
        }
        throw err;
      }
    );
    return postData;
  }

  transform (type: any, data: any) {
    return plainToClass(type, data, { enableImplicitConversion: true });
  }
}

exports.Validation = Validation;

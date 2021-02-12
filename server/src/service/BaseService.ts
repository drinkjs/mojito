/* eslint-disable no-shadow */
import { DocumentToObjectOptions, MongooseDocument } from "mongoose";

export default class BaseService {
  toDtoObject<T> (
    value: MongooseDocument | null,
    options?: DocumentToObjectOptions
  ): T | null {
    if (!value) {
      return null;
    }
    return value.toObject({
      versionKey: false,
      // eslint-disable-next-line no-unused-vars
      transform: (doc, ret, options) => {
        ret.id = doc.id;
        delete ret._id;
        return ret;
      },
      ...options,
    });
  }
}

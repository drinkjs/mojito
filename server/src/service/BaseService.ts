/* eslint-disable no-shadow */
import mongoose, { ToObjectOptions } from "ngulf/mongoose";

export default class BaseService {
  toDtoObject<T> (value: mongoose.Document, options?: ToObjectOptions): T {
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

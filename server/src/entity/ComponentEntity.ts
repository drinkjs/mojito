import { mongoose, prop } from "@typegoose/typegoose";

export interface ComponentProps {
  [propsName: string]: {
    type?: string;
    comment?: string;
    default?: any;
  };
}

export interface ComponentEvents {
  [eventName: string]: {
    comment?: string;
  };
}

export default class Component {
  @prop({ required: true })
  libName!: string;

  @prop()
  title: string;

  @prop({ required: true })
  type!: mongoose.Types.ObjectId;

  @prop()
  coverImg?: string;

  @prop()
  createTime?: string;

  @prop()
  updateTime?: string;

  @prop()
  createUser?: string;

  @prop({ default: 2 })
  origin: 1 | 2; // 来源:1系统2第三方

  @prop()
  props?: ComponentProps;

  @prop()
  events?: ComponentEvents;

  @prop()
  version: string;

  @prop()
  developLib: string; // 组件开发的底层库现阶段支持react16+, vue2, vue3
}

import { modelOptions, mongoose, prop, Severity } from "ngulf/typegoose";

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

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class Component {
  @prop({ required: true })
  name!: string;

  @prop()
  title!: string;

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
  origin!: 1 | 2; // 来源:1系统2第三方

  @prop()
  props?: ComponentProps;

  @prop()
  events?: ComponentEvents;

  @prop()
  version!: string;

  @prop()
  developLib!: string; // 组件开发的底层库，现阶段支持React, Vue2, Vue3

  @prop()
  dependencies?: string[]; // 组件依赖库的CDN地址 如：https://lib.baomitu.com/vue/3.0.7/vue.global.js
}

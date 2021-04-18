// import { mongoose, prop, Ref } from "@typegoose/typegoose";
// import Component from "./ComponentEntity";

export interface LayerStyle {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  [key: string]: any;
}

export interface LayerApi {
  url: string;
  method: string;
  interval?: number;
  params?: {
    [key: string]: any;
  };
}

export interface RelativePosition {
  layerId: string;
  offset: number;
  positionType: "left" | "right" | "top" | "bottom";
}

// export default class Layer {
//   @prop({ required: true })
//   name!: string;

//   @prop({ required: true })
//   screenId!: mongoose.Types.ObjectId;

//   @prop({ required: true, ref: () => Component })
//   componentId!: Ref<Component>;

//   @prop({ required: true })
//   initSize: boolean;

//   @prop()
//   props?: { [key: string]: any };

//   @prop()
//   events?: { [key: string]: any };

//   @prop()
//   eventLock?: boolean;

//   @prop({ required: true })
//   style!: LayerStyle;

//   @prop()
//   api?: LayerApi;

//   @prop()
//   isHide?: boolean;

//   @prop()
//   isLock?: boolean;

//   @prop()
//   createTime?: string;

//   @prop()
//   updateTime?: string;

//   @prop({ required: true, default: 0 })
//   status: 0 | 1;

//   @prop()
//   group?: string;

//   @prop()
//   groupLock?: boolean;

//   @prop()
//   groupHide?: boolean;

//   @prop({ default: 0 })
//   reloadKey?: number;

//   @prop()
//   anime?: {[key:string]:any}
// }

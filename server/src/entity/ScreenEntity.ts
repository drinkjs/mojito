import {
  Ref,
  modelOptions,
  mongoose,
  prop,
  Severity,
} from "@typegoose/typegoose";
// import Component from "./ComponentEntity";
import Project from "./ProjectEntity";

export interface ScreenOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  color?: string;
  backgroundImage?: string;
  backgroundRepeat?: string;
  fontFamily?: string;
  fontSize?: string;
}

interface LayerStyle {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  [key: string]: any;
}
interface LayerApi {
  url: string;
  method: string;
  interval?: number;
  params?: {
    [key: string]: any;
  };
}
export interface LayerInfo {
  name: string;
  initSize: boolean;
  style: LayerStyle;
  component: string; // 只保存组件id
  updateFlag?: string | number;
  props?: { [key: string]: any };
  events?: { [key: string]: any };
  eventLock?: boolean;
  api?: LayerApi;
  hide?: boolean;
  lock?: boolean;
  group?: string;
  groupLock?: boolean;
  groupHide?: boolean;
  reloadKey?: number;
  anime?: { [key: string]: any };
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class Screen {
  @prop({ required: true, ref: () => Project })
  projectId!: Ref<Project>;

  @prop({ required: true })
  name!: string;

  @prop({ type: mongoose.Schema.Types.Mixed })
  style?: ScreenOptions;

  @prop()
  createTime: string;

  @prop()
  updateTime: string;

  @prop()
  createUser?: string;

  @prop({ default: 0, select: false })
  status: 0 | 1; // 0:删除1正常;

  @prop()
  coverImg?: string;

  @prop()
  layers?: LayerInfo[];
}

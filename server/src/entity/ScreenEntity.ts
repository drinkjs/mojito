import { mongoose, prop, Ref } from "@typegoose/typegoose";
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
}

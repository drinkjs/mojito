import { prop } from "@typegoose/typegoose";

export default class Project {
  @prop({ required: true })
  name!: string;

  @prop()
  createTime: string;

  @prop()
  updateTime: string;

  @prop()
  createUser?: string;

  @prop({ default: 0, select: false })
  status: 0 | 1 | undefined; // 0:删除1正常;
}

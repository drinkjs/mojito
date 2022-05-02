import { modelOptions, prop } from "ngulf/typegoose";

@modelOptions({ options: { customName: "component_type" } })
export default class ComponentType {
  @prop({ required: true })
  name!: string;

  @prop()
  pid?: string;

  @prop()
  icon?: string;

  @prop({ default: 0, select: false })
  status: 0 | 1 | undefined; // 0:删除1正常;
}

import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({ options: { customName: "component_type" } })
export default class ComponentType {
  @prop({ required: true })
  name!: string;

  @prop()
  pid?: string;

  @prop()
  icon?: string;
}

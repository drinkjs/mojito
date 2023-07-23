import { ClearOutlined } from "@ant-design/icons";
import { Button, ColorPicker, Space } from "antd";
import ItemLabel from "./ItemLabel";

export function ColorSetting(props: {
	label: string;
	value?: string;
  defaultColor?:string
	onChange: (color: string) => void;
}) {
  const {value, label, defaultColor, onChange} = props;
	return (
		<Space>
      <ItemLabel>{label}</ItemLabel>
      <Space.Compact block>
        <ColorPicker
          size="small"
          value={value || defaultColor}
          onChangeComplete={(color)=>{
            onChange(color.toHexString())
          }}
        />
        <Button icon={<ClearOutlined />} size="small" onClick={()=>onChange(defaultColor || "#fff")} />
      </Space.Compact>
		</Space>
	);
}

import { ClearOutlined } from "@ant-design/icons";
import { Button, ColorPicker, Space } from "antd";
import ItemLabel from "./ItemLabel";

export function ColorSetting(props: {
	label?: string;
	value?: string;
  defaultColor?:string
  labelStyle?:React.CSSProperties
	onChange: (color?: string) => void;
}) {
  const {value, label, defaultColor, labelStyle, onChange} = props;
	return (
		<Space>
      {label && <ItemLabel style={labelStyle}>{label}</ItemLabel>}
      <Space.Compact block>
        <ColorPicker
          size="small"
          value={value || defaultColor || "#000"}
          onChangeComplete={(color)=>{
            onChange(color.toHexString())
          }}
        />
        <Button icon={<ClearOutlined />} size="small" onClick={()=>onChange(undefined)} />
      </Space.Compact>
		</Space>
	);
}

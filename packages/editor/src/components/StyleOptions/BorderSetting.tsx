import { Col, InputNumber, Row, Select } from "antd";
import { ColorSetting } from "./ColorSetting";
import ItemLabel from "./ItemLabel";

const { Option } = Select;

const BorderSetting = (props: {
	value?: any;
	onChange: (type: string, value: any) => void;
}) => {
	const { onChange, value } = props;
	return (
		<Row gutter={[6, 6]}>
			<Col span={12}>
				<ItemLabel>风格</ItemLabel>
				<Select
					style={{ width: "100%", marginTop: "6px" }}
					defaultValue="auto"
					value={value && value.borderStyle ? value.borderStyle : "none"}
					onChange={(val) => {
						onChange("borderStyle", val);
					}}
				>
					<Option value="none">none</Option>
					<Option value="solid">solid</Option>
					<Option value="dotted">dotted</Option>
					<Option value="dashed">dashed</Option>
					<Option value="double">double</Option>
					<Option value="groove">groove</Option>
					<Option value="ridge">ridge</Option>
					<Option value="inset">inset</Option>
					<Option value="outset">outset</Option>
					<Option value="hidden">hidden</Option>
				</Select>
			</Col>
			<Col span={12}>
				<ItemLabel>大小</ItemLabel>
				<InputNumber
					value={value ? value.borderWidth : undefined}
					style={{ width: "100%", marginTop: "6px" }}
					onChange={(val) => {
						onChange("borderWidth", val);
					}}
				/>
			</Col>
			<Col span={12}>
				{/* <ColorSetting
					value={value ? value.borderColor : undefined}
					onChange={(val) => {
						onChange("borderColor", val);
					}}
          label="颜色"
				/> */}
        <ItemLabel>位置</ItemLabel>
				<Select
					style={{ width: "100%", marginTop: "6px" }}
					// value={value && value.borderStyle ? value.borderStyle : "none"}
					onChange={(val) => {
						onChange("borderStyle", val);
					}}
          allowClear
          mode="multiple"
				>
          <Option value="top">top</Option>
          <Option value="right">right</Option>
					<Option value="bottom">bottom</Option>
					<Option value="left">left</Option>
				</Select>
			</Col>
			<Col span={12}>
				<ItemLabel>圆角</ItemLabel>
				<InputNumber
					value={value ? value.borderRadius : undefined}
					style={{ width: "100%", marginTop: "6px" }}
					onChange={(val) => {
						onChange("borderRadius", val);
					}}
				/>
			</Col>
		</Row>
	);
};

export default BorderSetting;

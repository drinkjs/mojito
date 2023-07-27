import { Col, InputNumber, Row, Select } from "antd";
import ItemLabel from "./ItemLabel";

const { Option } = Select;

const FontSetting = (props: {
	value?: any;
	onChange: (type: string, value: any) => void;
}) => {
	const { onChange, value } = props;

	return (
		<Row gutter={[6, 6]}>
			<Col span={12}>
				<ItemLabel>字体</ItemLabel>
				<Select
					style={{ width: "100%", marginTop: "6px" }}
					defaultValue="auto"
					value={value && value.fontFamily ? value.fontFamily : "auto"}
					onChange={(val) => {
						onChange("fontFamily", val);
					}}
				>
					<Option value="auto">auto</Option>
					<Option value="微软雅黑">微软雅黑</Option>
					<Option value="宋体">宋体</Option>
					<Option value="黑体">黑体</Option>
				</Select>
			</Col>

			<Col span={12}>
				<ItemLabel>大小</ItemLabel>
				<InputNumber
					value={value && value.fontSize ? value.fontSize : 14}
					style={{ width: "100%", marginTop: "6px" }}
					onChange={(val) => {
						onChange("fontSize", val);
					}}
				/>
			</Col>
			<Col span={12}>
				<ItemLabel>加粗</ItemLabel>
				<Select
					style={{ width: "100%", marginTop: "6px" }}
					value={value && value.fontWeight ? value.fontWeigh : "normal"}
					onChange={(val) => {
						onChange("fontWeight", val);
					}}
				>
					<Option value="normal">normal</Option>
					<Option value="bold">bold</Option>
					<Option value={100}>100</Option>
					<Option value={200}>200</Option>
					<Option value={300}>300</Option>
					<Option value={500}>500</Option>
					<Option value={600}>600</Option>
				</Select>
			</Col>

			<Col span={12}>
				<ItemLabel>对齐</ItemLabel>
				<Select
					style={{ width: "100%", marginTop: "6px" }}
					value={value && value.textAlign ? value.textAlign : "left"}
					onChange={(val) => {
						onChange("textAlign", val);
					}}
				>
					<Option value="left">left</Option>
					<Option value="center">center</Option>
					<Option value="right">right</Option>
				</Select>
			</Col>
		</Row>
	);
};

export default FontSetting;

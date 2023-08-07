import { Col, InputNumber, Row, Select } from "antd";
import { ColorSetting } from "./ColorSetting";
import ItemLabel from "./ItemLabel";

const { Option } = Select;

export type Border = {
	borderStyle?: string;
	borderWidth?: number;
	borderPosition?: string[];
	borderRadius?: number;
	borderColor?:string
};

export const BorderSetting = (props: {
	value?: Border;
	onChange: (value?: Border) => void;
}) => {
	const { onChange, value } = props;

	return (
		<>
			<h4
				style={{
					display: "flex",
					alignItems: "center",
					gap: "1em",
				}}
			>
				<span>边框</span>
				<ColorSetting
					value={value ? value.borderColor : undefined}
					onChange={(borderColor?: string) => {
						onChange({ ...value, borderColor });
					}}
				/>
			</h4>

			<Row gutter={[6, 6]}>
				<Col span={12}>
					<ItemLabel>风格</ItemLabel>
					<Select
						style={{ width: "100%", marginTop: "6px" }}
						value={value ? value.borderStyle : undefined}
						onChange={(val) => {
							onChange({ ...value, borderStyle: val });
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
							onChange({ ...value, borderWidth: val ?? undefined });
						}}
					/>
				</Col>
				<Col span={12}>
					<ItemLabel>位置</ItemLabel>
					<Select
						style={{ width: "100%", marginTop: "6px" }}
						value={value ? value.borderPosition : undefined}
						onChange={(val) => {
							onChange({ ...value, borderPosition: val });
						}}
						allowClear
						mode="multiple"
						defaultActiveFirstOption={false}
					>
						<Option value="Top">Top</Option>
						<Option value="Right">Right</Option>
						<Option value="Bottom">Bottom</Option>
						<Option value="Left">Left</Option>
					</Select>
				</Col>
				<Col span={12}>
					<ItemLabel>圆角</ItemLabel>
					<InputNumber
						value={value ? value.borderRadius : undefined}
						style={{ width: "100%", marginTop: "6px" }}
						onChange={(val) => {
							onChange({ ...value, borderRadius: val ?? undefined });
						}}
					/>
				</Col>
			</Row>
		</>
	);
};

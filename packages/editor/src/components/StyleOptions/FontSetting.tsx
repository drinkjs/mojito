import { Col, InputNumber, Row, Select } from "antd";
import { ColorSetting } from "./ColorSetting";
import ItemLabel from "./ItemLabel";

const { Option } = Select;

type Font = {
	fontFamily?: string;
	fontWeight?: number;
	textAlign?: string;
	fontSize?: number;
	color?: string;
};

const fontFaces: string[] = [
	"Arial",
	"Arial Black",
	"Bahnschrift",
	"Calibri",
	"Cambria",
	"Cambria Math",
	"Candara",
	"Comic Sans MS",
	"Consolas",
	"Constantia",
	"Corbel",
	"Courier New",
	"Ebrima",
	"Franklin Gothic Medium",
	"Gabriola",
	"Gadugi",
	"Georgia",
	"HoloLens MDL2 Assets",
	"Impact",
	"Ink Free",
	"Javanese Text",
	"Leelawadee UI",
	"Lucida Console",
	"Lucida Sans Unicode",
	"Malgun Gothic",
	"Marlett",
	"Microsoft Himalaya",
	"Microsoft JhengHei",
	"Microsoft New Tai Lue",
	"Microsoft PhagsPa",
	"Microsoft Sans Serif",
	"Microsoft Tai Le",
	"Microsoft YaHei",
	"Microsoft Yi Baiti",
	"MingLiU-ExtB",
	"Mongolian Baiti",
	"MS Gothic",
	"MV Boli",
	"Myanmar Text",
	"Nirmala UI",
	"Palatino Linotype",
	"Segoe MDL2 Assets",
	"Segoe Print",
	"Segoe Script",
	"Segoe UI",
	"Segoe UI Historic",
	"Segoe UI Emoji",
	"Segoe UI Symbol",
	"SimSun",
	"Sitka",
	"Sylfaen",
	"Symbol",
	"Tahoma",
	"Times New Roman",
	"Trebuchet MS",
	"Verdana",
	"Webdings",
	"Wingdings",
	"Yu Gothic",
];

export const FontSetting = (props: {
	value?: Font;
	onChange: (value?: Font) => void;
	labelStyle?: React.CSSProperties;
}) => {
	const { onChange, labelStyle, value } = props;
	return (
		<>
			<h4
				style={{
					display: "flex",
					alignItems: "center",
					gap: "1em",
				}}
			>
				<span>文字</span>
				<ColorSetting
					value={value ? value.color : undefined}
					onChange={(color?: string) => {
						onChange({...value, color})
					}}
				/>
			</h4>
			<Row gutter={[6, 6]}>
				<Col span={12}>
					<ItemLabel style={labelStyle}>字体</ItemLabel>
					<Select
						style={{ width: "100%", marginTop: "6px" }}
						value={value ? value.fontFamily : undefined}
						onChange={(fontFamily) => {
							onChange({...value, fontFamily});
						}}
						allowClear
					>
						{
							fontFaces.map(v => <Option key={v} value={v}>{v}</Option>)
						}
					</Select>
				</Col>

				<Col span={12}>
					<ItemLabel style={labelStyle}>大小</ItemLabel>
					<InputNumber
						value={value && value.fontSize ? value.fontSize : undefined}
						style={{ width: "100%", marginTop: "6px" }}
						onChange={(val) => {
							onChange({...value, fontSize: val ?? undefined});
						}}
					/>
				</Col>
				<Col span={12}>
					<ItemLabel style={labelStyle}>加粗</ItemLabel>
					<Select
						style={{ width: "100%", marginTop: "6px" }}
						value={value ? value.fontWeight : undefined}
						onChange={(fontWeight) => {
							onChange({...value, fontWeight});
						}}
						allowClear
					>
						<Option value={100}>100</Option>
						<Option value={200}>200</Option>
						<Option value={300}>300</Option>
						<Option value={400}>400</Option>
						<Option value={500}>500</Option>
						<Option value={600}>600</Option>
						<Option value={700}>700</Option>
						<Option value={800}>800</Option>
					</Select>
				</Col>

				<Col span={12}>
					<ItemLabel style={labelStyle}>对齐</ItemLabel>
					<Select
						style={{ width: "100%", marginTop: "6px" }}
						value={value ? value.textAlign : undefined}
						onChange={(textAlign) => {
							onChange({...value, textAlign});
						}}
					>
						<Option value="left">left</Option>
						<Option value="center">center</Option>
						<Option value="right">right</Option>
					</Select>
				</Col>
			</Row>
		</>
	);
};

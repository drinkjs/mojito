import { InputNumber, Slider, Row, Col, Space } from "antd";

export default function StyleSlider(props: {
	value?: number;
	onChange: (value: number | null) => void;
	label: string;
	min?: number;
	max?: number;
	formatter?: string;
}) {
	const { value, onChange, label, min, max, formatter = "" } = props;
	return (
		<>
			<div style={{ flexShrink: 0 }}>{label}</div>
			<div
				style={{
					display: "inline-flex",
					alignItems: "center",
					width: "100%",
					gap: 12,
				}}
			>
				<div style={{ flex: 1 }}>
					<Slider
						min={min}
						max={max}
						step={1}
						value={value && Math.round(value)}
						onChange={onChange}
					/>
				</div>
				<div style={{ width: "4em" }}>
					<InputNumber
						min={min}
						max={max}
						formatter={(val) =>
							val === undefined ? "" : `${parseInt(`${val}`)}${formatter}`
						}
						parser={(val) => (val ? parseInt(val.replace(formatter, "")) : 0)}
						style={{ width: "100%" }}
						value={value !== undefined ? Math.round(value) : 0}
						onChange={onChange}
						step={1}
					/>
				</div>
			</div>
		</>
	);
}

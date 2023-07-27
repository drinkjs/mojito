import { ColorSetting, SizeSetting } from "@/components/StyleOptions";
import BorderSetting from "@/components/StyleOptions/BorderSetting";
import FontSetting from "@/components/StyleOptions/FontSetting";
import StyleSlider from "@/components/StyleOptions/StyleSlider";
import { Col, Radio, Row } from "antd";
import { useEffect, useState } from "react";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";

const sizeItems = [
	{
		label: "X",
		key: "x",
	},
	{
		label: "Y",
		key: "y",
	},
	{
		label: "宽",
		key: "width",
	},
	{
		label: "高",
		key: "height",
	},
];

export default function StyleSetting() {
	const { canvasStore } = useCanvasStore();
  const [currLayer, setCurrLayer] = useState<LayerInfo | undefined>();

  useEffect(() => {
		if (canvasStore.selectedLayers.size > 1) {
			setCurrLayer(undefined)
		} else {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			setCurrLayer(layer);
		}
	}, [canvasStore, canvasStore.selectedLayers]);

	return (
		<section className={styles.settingRoot}>
      <div className={styles.settingTitle}>{currLayer?.name}</div>
			<div className={styles.attrItem}>
				<h4>位置与尺寸</h4>
				<Row gutter={[0, 6]}>
					{sizeItems.map((v) => {
						// const defaultStyleValue: any = defaultStyle;
						return (
							<Col span={12}>
								<SizeSetting
									key={v.key}
									label={v.label}
									onChange={(value: any) => {
										// onStyleChange(v.key, value);
									}}
									value={0}
									labelStyle={{ width: "1em" }}
								/>
							</Col>
						);
					})}
				</Row>
			</div>
			<div className={styles.attrItem}>
				<h4>颜色</h4>
				<Row>
					<Col span={12}>
						<ColorSetting
							label="背景颜色"
							// value={
							// 	defaultStyle && defaultStyle.backgroundColor
							// 		? defaultStyle.backgroundColor.toString()
							// 		: undefined
							// }
							onChange={(color: string | undefined) => {
								// onStyleChange("backgroundColor", color);
							}}
						/>
					</Col>
					<Col span={12}>
						<ColorSetting
							label="字体颜色"
							defaultColor="#000"
							// value={defaultStyle ? defaultStyle.color : undefined}
							onChange={(color: string | undefined) => {
								// onStyleChange("color", color);
							}}
						/>
					</Col>
				</Row>
			</div>
			{/* <div className={styles.title}>
				<p>文字</p>
				<div style={{ marginTop: "12px" }}>
					<FontSetting onChange={onStyleChange} value={defaultStyle} />
				</div>
			</div>
			<div className={styles.title}>
				<p>边框</p>
				<div style={{ marginTop: "12px" }}>
					<BorderSetting onChange={onStyleChange} value={defaultStyle} />
				</div>
			</div>
			<div className={styles.title}>
				<StyleSlider
					min={1}
					max={100}
					label="不透明度"
					formatter="%"
					value={
						defaultStyle && defaultStyle.opacity !== undefined
							? parseFloat(defaultStyle.opacity.toString()) * 100
							: 100
					}
					onChange={(value: number) => {
						onStyleChange("opacity", (value / 100).toFixed(2));
					}}
				/>
			</div>
			<div className={styles.title}>
				<StyleSlider
					min={0}
					max={200}
					label="缩放比例"
					formatter="%"
					value={
						defaultStyle && defaultStyle.scale !== undefined
							? defaultStyle.scale * 100
							: 100
					}
					onChange={(value: number) => {
						onStyleChange("scale", `${(value / 100).toFixed(2)}`);
					}}
				/>
			</div>*/}
      <div className={styles.attrItem}>
        <h4>文字</h4>
        <FontSetting onChange={()=>{}} />
      </div>
      <div className={styles.attrItem}>
        <h4>边框</h4>
        <BorderSetting onChange={()=>{}} />
      </div>
			<div className={styles.attrItem}>
				<StyleSlider
					min={0}
					max={360}
					label="旋转角度"
					// value={
					// 	defaultStyle && defaultStyle.rotate !== undefined
					// 		? parseInt(defaultStyle.rotate.replace("deg", ""))
					// 		: 0
					// }
					onChange={(value) => {
						// onStyleChange("rotate", `${value}deg`);
					}}
				/>
			</div> 
		</section>
	);
}

import CodeEditor from "@/components/CodeEditor";
import {
	BorderSetting,
	FontSetting,
	SizeSetting,
} from "@/components/StyleOptions";
import StyleSlider from "@/components/StyleOptions/StyleSlider";
import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";

const SizeItems = [
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

const PaddingItems = [
	{
		label: "上",
		key: "paddingTop",
	},
	{
		label: "右",
		key: "paddingRight",
	},
	{
		label: "左",
		key: "paddingLeft",
	},
	{
		label: "下",
		key: "paddingBottom",
	},
];

const MarginItems = [
	{
		label: "上",
		key: "marginTop",
	},
	{
		label: "右",
		key: "marginRight",
	},
	{
		label: "左",
		key: "marginLeft",
	},
	{
		label: "下",
		key: "marginBottom",
	},
];

export default function StyleSetting() {
	const { canvasStore } = useCanvasStore();
	const [currLayer, setCurrLayer] = useState<LayerInfo | undefined>();
	const [currStyle, setCurrStyle] = useState<any>({});

	useEffect(() => {
		if (canvasStore.selectedLayers.size === 1) {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			setCurrLayer(layer);
			setCurrStyle(layer.style);
		} else {
			setCurrLayer(undefined);
			setCurrStyle({});
		}
	}, [canvasStore, canvasStore.selectedLayers]);

	const onStyleChange = (value: Record<string, any>) => {
		if (currLayer) {
			canvasStore.updateStyle(currLayer, value);
		}
	};

	return (
		<section className={styles.settingRoot}>
			<div className={styles.settingTitle}>{currLayer?.name}</div>
			<div className={styles.attrItem}>
				<h4>位置与尺寸</h4>
				<Row gutter={[0, 6]}>
					{SizeItems.map((v) => {
						return (
							<Col span={12} key={v.key}>
								<SizeSetting
									key={v.key}
									label={v.label}
									onChange={(value?: any) => {
										onStyleChange({ [v.key]: value ?? 0 });
									}}
									value={currStyle[v.key]}
									labelStyle={{ width: "1em" }}
								/>
							</Col>
						);
					})}
				</Row>
			</div>
			<div className={styles.attrItem}>
				<h4>内边距</h4>
				<Row gutter={[0, 6]}>
					{PaddingItems.map((v) => {
						return (
							<Col span={12} key={v.key}>
								<SizeSetting
									key={v.key}
									label={v.label}
									onChange={(value?: any) => {
										onStyleChange({ [v.key]: value ?? 0 });
									}}
									value={currStyle[v.key]}
									labelStyle={{ width: "1em" }}
								/>
							</Col>
						);
					})}
				</Row>
			</div>
			<div className={styles.attrItem}>
				<h4>外边距</h4>
				<Row gutter={[0, 6]}>
					{MarginItems.map((v) => {
						return (
							<Col span={12} key={v.key}>
								<SizeSetting
									key={v.key}
									label={v.label}
									onChange={(value?: any) => {
										onStyleChange({ [v.key]: value ?? 0 });
									}}
									value={currStyle[v.key]}
									labelStyle={{ width: "1em" }}
								/>
							</Col>
						);
					})}
				</Row>
			</div>
			<div className={styles.attrItem}>
				<FontSetting
					value={currStyle.font}
					onChange={(font) => {
						onStyleChange({ font });
					}}
				/>
			</div>
			<div className={styles.attrItem}>
				<BorderSetting
					value={currStyle.border}
					onChange={(border) => {
						onStyleChange({ border });
					}}
				/>
			</div>
			<div className={styles.attrItem}>
				<StyleSlider
					min={0}
					max={360}
					label="旋转角度"
					value={
						currStyle.rotate !== undefined
							? parseInt(currStyle.rotate.replace("deg", ""), 10)
							: 0
					}
					onChange={(value) => {
						onStyleChange({ rotate: `${value ?? 0}deg` });
					}}
				/>
			</div>
			<div className={styles.attrItem}>
				<StyleSlider
					min={0}
					max={100}
					label="透明度"
					formatter="%"
					value={
						currStyle.opacity !== undefined ? (1 - currStyle.opacity) * 100 : 0
					}
					onChange={(value) => {
						onStyleChange({
							opacity: parseFloat((1 - (value ?? 0) / 100).toFixed(2)),
						});
					}}
				/>
			</div>
			<div className={styles.attrItem}>
				<h4>CSS</h4>
				<CodeEditor
					height={300}
					language="json"
					value={
						currLayer && currLayer.customStyle ? JSON.stringify(currLayer.customStyle, undefined, "  ") : undefined
					}
					onChange={(value) => {
						if (currLayer) {
							try{
								currLayer.customStyle = value ? JSON.parse(value) : value;
								canvasStore.refreshLayer([currLayer.id]);
							}catch(e){
								console.error(e)
							}
						}
					}}
				/>
			</div>
		</section>
	);
}

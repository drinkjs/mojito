import { useCallback, useMemo } from "react";
import { useCanvasStore } from "../../hook";
import { SizeSetting, ColorSetting } from "@/components/StyleOptions";
import styles from "./index.module.css";
import UploadImg from "@/components/UploadImg";
import { Radio } from "antd";

const sizeItems = [
	{
		label: "宽度",
		key: "width",
	},
	{
		label: "高度",
		key: "height",
	},
] as const;

export default function PageSetting() {
	const { canvasStore } = useCanvasStore();

	const onStyleChange = (key: string, value?: any) => {
    canvasStore.setPageStyle({ [key]: value});
	};

	const onUpload = useCallback((path: string | undefined) => {
		canvasStore.setPageStyle({ backgroundImage: path});
	}, [canvasStore]);

	const pageStyle = useMemo(
		() => canvasStore.screenInfo?.style,
		[canvasStore.screenInfo?.style]
	);

	return (
		<section className={styles.settingRoot}>
			<div className={styles.attrItem}>
				<h4>页面尺寸</h4>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					{sizeItems.map((v) => {
						return (
							<SizeSetting
								key={v.key}
								label={v.label}
								onChange={(value) => {
									onStyleChange(v.key, value);
								}}
								value={pageStyle ? pageStyle[v.key] : 0}
							/>
						);
					})}
				</div>
			</div>
			<div className={styles.attrItem}>
				<h4>颜色</h4>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<ColorSetting
						label="背景颜色"
						// defaultColor={DefaulBackgroundColor}
						value={pageStyle?.backgroundColor}
						onChange={(color: string | undefined) => {
							onStyleChange("backgroundColor", color);
						}}
					/>
					<ColorSetting
						label="字体颜色"
						defaultColor="#111"
						value={pageStyle?.color}
						onChange={(color: string | undefined) => {
							onStyleChange("color", color);
						}}
					/>
				</div>
			</div>
			{canvasStore.screenInfo && (
				<div className={styles.attrItem}>
					<h4>背景图</h4>
					<UploadImg
						data={{ id: canvasStore.screenInfo.id }}
						onChange={onUpload}
						value={pageStyle?.backgroundImage}
					/>
					{pageStyle &&
						pageStyle.backgroundImage && (
							<Radio.Group
								value={
									pageStyle.backgroundRepeat || "repeat"
								}
								buttonStyle="solid"
								onChange={(e) => {
									onStyleChange("backgroundRepeat", e.target.value);
								}}
							>
								<Radio.Button value="repeat">平铺</Radio.Button>
								<Radio.Button value="no-repeat">拉伸</Radio.Button>
							</Radio.Group>
						)}
				</div>
			)}
		</section>
	);
}

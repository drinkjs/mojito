/* eslint-disable @typescript-eslint/no-non-null-assertion */
import CodeEditor from "@/components/CodeEditor";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
	Collapse,
	CollapseProps,
	Input,
	InputNumber,
	Switch,
	Tooltip,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";

type EditorCallback = (value?: any) => void;

const EditorComponent = {
	string: (onChange: EditorCallback, defaultValue?: string) => (
		<Input.TextArea
			defaultValue={defaultValue}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
	object: (onChange: EditorCallback, defaultValue?: any) => (
		<CodeEditor
			height={300}
			language="json"
			defaultValue={
				defaultValue && JSON.stringify(defaultValue, undefined, "  ")
			}
			onChange={(value) => {
				onChange(value ? JSON.parse(value) : value);
			}}
		/>
	),
	array: (onChange: EditorCallback, defaultValue?: any) => (
		<CodeEditor
			height={300}
			language="json"
			defaultValue={
				defaultValue && JSON.stringify(defaultValue, undefined, "  ")
			}
			onChange={(value) => {
				onChange(value ? JSON.parse(value) : value);
			}}
		/>
	),
	number: (onChange: EditorCallback, defaultValue?: number) => (
		<InputNumber defaultValue={defaultValue} onChange={onChange} />
	),
	boolean: (onChange: EditorCallback, defaultValue?: boolean) => (
		<Switch defaultChecked={defaultValue} onChange={onChange} />
	),
};

export default function PropsSetting() {
	const { canvasStore } = useCanvasStore();
	const [componentPropsOptions, setComponentPropsOptions] = useState<
		ComponentPropsOptions[]
	>([]);
	const [currLayer, setCurrLayer] = useState<LayerInfo | undefined>();

	useEffect(() => {
		if (canvasStore.selectedLayers.size > 1) {
			setComponentPropsOptions([]);
			setCurrLayer(undefined)
		} else {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			setCurrLayer(layer);
			// 获取选中图层组件的props信息
			const componentInfo = canvasStore.layerComponentOptions.get(layer.id);
			const propsOptions: ComponentPropsOptions[] = [];
			
			if (componentInfo && componentInfo.props) {
				// 转换成数组方便展示
				Object.keys(componentInfo.props).map((key) => {
					console.log(componentInfo.props![key]);
					propsOptions.push({
						layerId: layer.id,
						key,
						...componentInfo.props![key],
					});
				});
			}
			setComponentPropsOptions(propsOptions);
		}
	}, [canvasStore, canvasStore.selectedLayers]);

	/**
	 * 设置组件props
	 */
	const onChange = useCallback(
		(key: string, value?: any) => {
			console.log(key, value);
			if (currLayer) {
				currLayer.props = { ...currLayer.props, [key]: value };
				canvasStore.refreshLayer([currLayer.id]);
			}
		},
		[currLayer, canvasStore]
	);

	const items: CollapseProps["items"] = useMemo(() => {
		return componentPropsOptions.map((v) => {
      const defaultValue = currLayer?.props && currLayer.props[v.key] !== undefined
						? currLayer.props[v.key]
						: v.default
			return {
				key: `${v.layerId}${v.key}`,
				label: v.description ? (
					<div>
						{v.name}
						<Tooltip title={v.description}>
							<InfoCircleOutlined style={{ marginLeft: "0.5em" }} />
						</Tooltip>
					</div>
				) : (
					v.name
				),
				children: EditorComponent[v.type] ? (
					EditorComponent[v.type](
						onChange.bind(null, v.key), defaultValue)
				) : (
					<Input.TextArea
						defaultValue={defaultValue}
						onChange={(e) => {
							onChange(v.key, e.target.value);
						}}
					/>
				),
			};
		});
	}, [componentPropsOptions, onChange, currLayer]);

	return (
		<div className={styles.propsRoot}>
			<div className={styles.settingTitle}>{currLayer?.name}</div>
			<Collapse items={items} size="small"></Collapse>
		</div>
	);
}

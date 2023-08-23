import CodeEditor from "@/components/CodeEditor";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
	Collapse,
	CollapseProps,
	Input,
	InputNumber,
	Select,
	Switch,
	Tooltip,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";

type EditorCallback = (value?: any) => void;

const EditorComponent: Record<string, (...args: any[]) => React.ReactNode> = {
	string: (onChange: EditorCallback, defaultValue?: string) => (
		<Input.TextArea
			defaultValue={defaultValue}
			onChange={(e) => onChange(e.target.value)}
		/>
	),
	object: (onChange: EditorCallback, defaultValue?: string) => (
		<CodeEditor
			height={300}
			language="json"
			value={defaultValue && JSON.stringify(defaultValue, undefined, "  ")}
			onChange={(value) => {
				onChange(value ? JSON.parse(value) : value);
			}}
		/>
	),
	array: (onChange: EditorCallback, defaultValue?: string) => (
		<CodeEditor
			height={300}
			language="json"
			value={defaultValue && JSON.stringify(defaultValue, undefined, "  ")}
			onChange={(value) => {
				onChange(value ? JSON.parse(value) : value);
			}}
		/>
	),
	number: (onChange: EditorCallback, defaultValue?: number) => (
		<InputNumber value={defaultValue} onChange={onChange} />
	),
	boolean: (onChange: EditorCallback, defaultValue?: boolean) => (
		<Switch checked={defaultValue} onChange={onChange} />
	),
	select: (
		onChange: EditorCallback,
		data: Array<string | number>,
		defaultValue?: string | number
	) => {
		return (
			<Select
				style={{ width: "100%" }}
				allowClear
				options={data.map((v) => ({ label: v, value: v }))}
				onChange={onChange}
				value={defaultValue}
			></Select>
		);
	},
};

export default function PropsSetting() {
	const { canvasStore } = useCanvasStore();
	const [componentPropsOptions, setComponentPropsOptions] = useState<
		ComponentPropsOptions[]
	>([]);
	const [currLayer, setCurrLayer] = useState<LayerInfo | undefined>();

	useEffect(() => {
		if (canvasStore.selectedLayers.size === 1) {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			setCurrLayer(layer);
			// 获取选中图层组件的props信息
			const componentInfo = canvasStore.layerComponentOptions.get(layer.id);
			const propsOptions: ComponentPropsOptions[] = [];

			if (componentInfo && componentInfo.props) {
				// 组件的所有props
				for (const key in componentInfo.props) {
					console.log(componentInfo.props![key]);
					propsOptions.push({
						layerId: layer.id,
						key,
						...componentInfo.props![key],
					});
				}
			}
			setComponentPropsOptions(propsOptions);
		} else {
			setComponentPropsOptions([]);
			setCurrLayer(undefined);
		}
	}, [canvasStore, canvasStore.selectedLayers]);

	/**
	 * 设置组件props
	 */
	const onChange = useCallback(
		(key: string, value?: any) => {
			console.log(key, value);
			if (currLayer) {
				canvasStore.updateProps(currLayer, { [key]: value });
			}
		},
		[currLayer, canvasStore]
	);

	const items: CollapseProps["items"] = useMemo(() => {
		return componentPropsOptions.map((v) => {
			const editType = (Array.isArray(v.type) ? "select" : v.type) as string;
			const defaultValue =
				currLayer?.props && currLayer.props[v.key] !== undefined
					? currLayer.props[v.key]
					: v.default;
			return {
				key: `${v.layerId}${v.key}`,
				label: v.description ? (
					<div>
						{v.key} {v.name}
						<Tooltip title={v.description}>
							<InfoCircleOutlined style={{ marginLeft: "0.5em" }} />
						</Tooltip>
					</div>
				) : (
					`${v.key} ${v.name}`
				),
				children: EditorComponent[editType] ? (
					EditorComponent[editType](
						onChange.bind(null, v.key),
						editType === "select" ? v.type : defaultValue,
						defaultValue
					)
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

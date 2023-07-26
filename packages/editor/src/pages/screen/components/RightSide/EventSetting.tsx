import { compileCode, runCode } from "@/common/util";
import CodeEditor from "@/components/CodeEditor";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useUpdateEffect } from "ahooks";
import { Button, message, Select, Space, Switch, Tooltip } from "antd";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";

type EventOptions = { label: string; value: string; description?: string };
type EventCallback = {
	sourceCode?: string;
	isSync?: boolean;
	buildCode?: string;
};

type ReducerState = {
	selectedEvent?: EventOptions;
	currLayer?: LayerInfo;
	callback?: EventCallback;
};

type ReducerAction =
	| { type: ReducerType.ChangeLayer; payload?: LayerInfo }
	| { type: ReducerType.ChangeEvent; payload?: EventOptions }
	| { type: ReducerType.ChangeCode; payload?: EventCallback };

enum ReducerType {
	ChangeLayer,
	ChangeEvent,
	ChangeCode,
}

function evnetReducer(state: ReducerState, action: ReducerAction) {
	const { type, payload } = action;
	const { currLayer } = state;
	switch (type) {
		case ReducerType.ChangeLayer:
			if (payload && state.currLayer && state.currLayer.id === payload.id) {
				state.currLayer = payload;
				return state;
			}
			return {
				selectedEvent: undefined,
				callback: undefined,
				currLayer: payload,
			};
		case ReducerType.ChangeEvent:
			return {
				...state,
				selectedEvent: payload,
				callback:
					currLayer && currLayer.eventHandler && payload
						? currLayer.eventHandler[payload.value]
						: undefined,
			};
		case ReducerType.ChangeCode:
			return {
				...state,
				callback: payload,
			};
		default:
			return state;
	}
}

export default function EventSetting() {
	const { canvasStore } = useCanvasStore();
	const [events, setEvents] = useState<EventOptions[]>([]);
	const [eventState, dispatch] = useReducer<
		Reducer<ReducerState, ReducerAction>
	>(evnetReducer, {
		selectedEvent: undefined,
		currLayer: undefined,
		callback: undefined,
	});

	const { selectedEvent, currLayer, callback } = eventState;

	useEffect(() => {
		if (
			canvasStore.selectedLayers.size > 1 ||
			canvasStore.selectedLayers.size === 0
		) {
			dispatch({ type: ReducerType.ChangeLayer });
		} else {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			if (eventState.currLayer && eventState.currLayer.id === layer.id) {
				eventState.currLayer = layer;
				return;
			}
			// 选中图层发生改变
			dispatch({ type: ReducerType.ChangeLayer, payload: layer });
			// 获取选中图层组件的event信息
			const eventArr: { label: string; value: string; description?: string }[] =
				[];
			const componentInfo = canvasStore.layerComponentOptions.get(layer.id);
			if (componentInfo && componentInfo.events) {
				// 遍历组件事件
				for (const key in componentInfo.events) {
					eventArr.push({
						label: key,
						value: key,
						description: componentInfo.events[key].description,
					});
				}
			}
			setEvents(eventArr);
		}
	}, [canvasStore, eventState, canvasStore.selectedLayers]);

	/**
	 * 更新事件处理函数源码
	 */
	useUpdateEffect(() => {
		const { currLayer, selectedEvent, callback } = eventState;
		if (currLayer && selectedEvent && callback) {
			if (!currLayer.eventHandler) {
				currLayer.eventHandler = {};
				currLayer.eventHandler[selectedEvent.value] = {
					isSync: callback.isSync,
					sourceCode: callback.sourceCode,
				};
			} else {
				currLayer.eventHandler[selectedEvent.value] = { ...callback };
			}
			// 刷新ui
			currLayer.eventHandler = { ...currLayer.eventHandler };
			canvasStore.refreshLayer([currLayer.id]);
		}
	}, [eventState]);

	/**
	 * 事件选择回调
	 * @param value
	 */
	const selectHansler = (value?: string) => {
		dispatch({
			type: ReducerType.ChangeEvent,
			payload: value ? events.find((v) => v.value === value) : undefined,
		});
	};

	/**
	 * 编译代码
	 * @returns
	 */
	const build = () => {
		if (callback && callback.sourceCode) {
			try {
				// 编译代码
				const { code } = compileCode(
					callback.sourceCode.replace(/[\n\r]+/g, "")
				);
				const runRel = code ? runCode(code) : null;
				if (runRel !== null && typeof runRel !== "function") {
					message.error("不是一个有效事件处理函数");
					return;
				}
				dispatch({
					type: ReducerType.ChangeCode,
					payload: { ...callback, buildCode: code || undefined },
				});
				message.success("编译成功");
			} catch (e) {
				console.error(e);
				message.error("编译失败");
			}
		} else {
			dispatch({
				type: ReducerType.ChangeCode,
				payload: { ...callback, buildCode: undefined },
			});
			message.success("编译成功");
		}
	};

	return (
		<div className={styles.eventRoot}>
			<div className={styles.settingTitle}>{currLayer?.name}</div>
			<div className={styles.event}>
				<div>事件</div>
				<Select
					placeholder="请选择事件"
					style={{ width: "100%", marginTop: "0.5em" }}
					onChange={selectHansler}
					options={events}
					value={selectedEvent?.value}
				/>
			</div>
			<div className={styles.eventHandler}>
				<div className={styles.eventHandlerTitle}>
					<Space align="center">
						{selectedEvent && "事件处理"}
						{selectedEvent && selectedEvent.description && (
							<Tooltip title={selectedEvent.description}>
								<InfoCircleOutlined />
							</Tooltip>
						)}
						{selectedEvent && (
							<Switch
								checkedChildren="同步"
								unCheckedChildren="同步"
								size="small"
								checked={callback?.isSync}
								onChange={(checked) => {
									dispatch({
										type: ReducerType.ChangeCode,
										payload: { ...callback, isSync: checked },
									});
								}}
							/>
						)}
					</Space>
					<span>
						<Button
							size="small"
							type="primary"
							disabled={!callback?.sourceCode}
							onClick={build}
						>
							编译
						</Button>
					</span>
				</div>
				<div style={{ flexGrow: 1, paddingTop: "0.5em" }}>
					<CodeEditor
						readOnly={!selectedEvent}
						language="javascript"
						value={callback?.sourceCode || ""}
						onChange={(code) => {
							dispatch({
								type: ReducerType.ChangeCode,
								payload: { ...callback, sourceCode: code },
							});
						}}
					/>
				</div>
			</div>
		</div>
	);
}

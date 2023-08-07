import { compileCode, runCode } from "@/common/util";
import CodeEditor from "@/components/CodeEditor";
import { MojitoLayerEvent, MojitoLayerEventInfo } from "@/config";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useUpdateEffect } from "ahooks";
import { Button, message, Select, Space, Switch, Tooltip } from "antd";
import { Reducer, useEffect, useReducer, useState } from "react";
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
	callbackCode?: EventCallback;
};

enum ReducerType {
	ChangeLayer,
	ChangeEvent,
	ChangeCode,
}

type ReducerAction =
	| { type: ReducerType.ChangeLayer; payload?: LayerInfo }
	| { type: ReducerType.ChangeEvent; payload?: EventOptions }
	| { type: ReducerType.ChangeCode; payload?: EventCallback };

const  evnetReducer = (state: ReducerState, action: ReducerAction)=> {
	const { type, payload } = action;
	const { currLayer } = state;
	switch (type) {
		case ReducerType.ChangeLayer:
			if (payload && state.currLayer && state.currLayer.id === payload.id) {
				// 原图层没变
				state.currLayer = payload;
				return state;
			}
			// 图层已改变
			return {
				selectedEvent: undefined,
				callbackCode: undefined,
				currLayer: payload,
			};
		case ReducerType.ChangeEvent:
			return {
				...state,
				selectedEvent: payload,
				callbackCode:
					currLayer && currLayer.eventHandler && payload
						? currLayer.eventHandler[payload.value]
						: undefined,
			};
		case ReducerType.ChangeCode:
			return {
				...state,
				callbackCode: payload,
			};
		default:
			return state;
	}
}

export default function EventSetting() {
	const [building, setBuilding] = useState(false)
	const { canvasStore } = useCanvasStore();
	const [events, setEvents] = useState<EventOptions[]>([]);
	const [eventState, dispatch] = useReducer<
		Reducer<ReducerState, ReducerAction>
	>(evnetReducer, {
		selectedEvent: undefined,
		currLayer: undefined,
		callbackCode: undefined,
	});

	const { selectedEvent, currLayer, callbackCode } = eventState;

	useEffect(() => {
		if (
			canvasStore.selectedLayers.size !== 1
		) {
			dispatch({ type: ReducerType.ChangeLayer });
		} else {
			const layer = Array.from(canvasStore.selectedLayers)[0];
			// 选中图层发生改变
			dispatch({ type: ReducerType.ChangeLayer, payload: layer });
		}
	}, [canvasStore, canvasStore.selectedLayers]);

	/**
	 * 图层改变
	 */
	useEffect(() => {
		if(!eventState.currLayer){
			setEvents([]);
			return;
		}
		// 获取选中图层组件的event信息
		const eventArr: { label: string; value: string; description?: string }[] =
			[];

		// 图层自带事件
		MojitoLayerEventInfo.forEach(event =>{
			eventArr.push({
				label: event.name,
				value: event.eventName,
			})
		});

		const componentInfo = canvasStore.layerComponentOptions.get(eventState.currLayer.id);
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
	}, [eventState.currLayer, canvasStore.layerComponentOptions])

	/**
	 * 更新事件处理函数源码
	 */
	useUpdateEffect(() => {
		const { currLayer, selectedEvent, callbackCode } = eventState;
		if (currLayer && selectedEvent && callbackCode) {
			canvasStore.updateEventHandler(currLayer, { [selectedEvent.value]: callbackCode })
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
	const build = async () => {
		if (callbackCode && callbackCode.sourceCode) {
			setBuilding(true);
			try {
				// 编译代码
				const { code } = await compileCode(
					callbackCode.sourceCode.replace(/[\n\r]+/g, "")
				);
				const runRel = code ? runCode(code) : null;
				if (runRel !== null && typeof runRel !== "function") {
					message.error("不是一个有效事件处理函数");
					return;
				}
				dispatch({
					type: ReducerType.ChangeCode,
					payload: { ...callbackCode, buildCode: code || undefined },
				});
				message.success("编译成功");
			} catch (e) {
				console.error(e);
				message.error("编译失败");
			}finally{
				setBuilding(false)
			}
		} else {
			dispatch({
				type: ReducerType.ChangeCode,
				payload: { ...callbackCode, buildCode: undefined },
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
						{selectedEvent &&  !([MojitoLayerEvent.onMount, MojitoLayerEvent.onUnmount, MojitoLayerEvent.onMessage].includes(selectedEvent.value)) && (
							<Switch
								checkedChildren="同步"
								unCheckedChildren="同步"
								size="small"
								checked={callbackCode?.isSync}
								onChange={(checked) => {
									dispatch({
										type: ReducerType.ChangeCode,
										payload: { ...callbackCode, isSync: checked },
									});
								}}
							/>
						)}
					</Space>
					<span>
						<Button
							size="small"
							type="primary"
							disabled={!callbackCode?.sourceCode}
							onClick={build}
							loading={building}
						>
							编译
						</Button>
					</span>
				</div>
				<div style={{ flexGrow: 1, paddingTop: "0.5em" }}>
					<CodeEditor
						readOnly={!selectedEvent}
						language="javascript"
						value={callbackCode?.sourceCode}
						onChange={(code) => {
							console.log("event code", code);
							dispatch({
								type: ReducerType.ChangeCode,
								payload: { ...callbackCode, sourceCode: code },
							});
						}}
					/>
				</div>
			</div>
		</div>
	);
}

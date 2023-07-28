/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 图层类，负责生成组件，控制组件的大小位置，请求数据
 */

import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import _ from "lodash-es";
import { Request } from "@mojito/common/network";
import Render, { ComponentMountEvent, RenderAction } from "./Render";
import styles from "./index.module.css";
import { useMount, useUpdateEffect } from "ahooks";
import { useCanvasStore } from "../../hook";
import { runCode } from "@/common/util";
import { syncHelper } from "@/common/syncHelper";
import { Border } from "@/components/StyleOptions";

const EventSyncCallFlag = Symbol.for("EventSyncCallFlag");

const request = new Request();

function showHandlerError(layerName: string, error: any) {
	// Message.error(`${layerName}事件处理错误:${error.message}`);
	console.error(`${layerName}事件处理错误:${error.message}`);
}
/**
 * 解释数源中的参数
 * @param params
 */
export function parseParams(params: string) {
	if (!params) return {};
	// 替换${xxx}变量，变量会对应映射global的值 {"a":"${myname}"}会替换会{"a":global["myname"]}
	const globalObj: any = window;
	try {
		const regx = /"\${[\d\w_]+}"/g;
		const newParams = params.replace(regx, (match: string) => {
			const val = match.substring(3, match.length - 2);
			if (
				typeof globalObj[val] === "object" ||
				typeof globalObj[val] === "string"
			) {
				return JSON.stringify(globalObj[val]);
			}
			return globalObj[val] === undefined ? null : globalObj[val];
		});
		return JSON.parse(newParams);
	} catch (e) {
		// Message.error('参数解释错误');
		console.error("参数解释错误");
		return {};
	}
}

/**
 * 事件里的网络请求
 */
export function eventRequest(
	originUrl: string,
	method: string,
	params?: any,
	options?: any
) {
	// return request(originUrl, method, params || {}, {
	//   prefix: '/',
	//   checkCode: false,
	//   ...options
	// });

	return request.req(originUrl, { method, ...options });
}

export const LayerEvent: { [key: string]: string } = {
	onLoad: "__onLayerLoad__",
	onDataSource: "__onLayerData__",
	onShow: "__onLayerShow__",
	onUnload: "__onLayerUnload__",
	onSync: "__onSync__",
};

export type LayerAction = {
	eventSync: (event?: Record<string, { args: any[]; retruns?: any }>) => void;
};

interface LayerProps extends React.HTMLAttributes<Element> {
	data: LayerInfo;
	defaultWidth: number;
	defaultHeight: number;
	enable?: boolean;
	hide?: boolean;
	onSelected?: (
		data: LayerInfo,
		e?: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	onRef?: (id: string, actionRef: LayerAction) => void;
}

interface EventValue {
	styles?: ComponentStyleQuery;
	props?: { [key: string]: any };
}

interface EventSync {
	event: string;
	args: any;
	syncPage: boolean;
}

const Layer: React.FC<LayerProps> = ({
	data,
	enable = false,
	onSelected,
	defaultWidth,
	defaultHeight,
	onRef,
	...restProps
}) => {
	const { canvasStore } = useCanvasStore();
	const targetRef = useRef<HTMLDivElement | null>(null);
	const renderRef = useRef<RenderAction>();
	// 图层是否隐藏
	const [hide, setHide] = useState(false);
	// 事件处理
	const eventHandlers = useRef<Record<string, (...args: any[]) => any>>({});

	useMount(() => {
		// 缓存图层dom节点
		if (targetRef.current)
			canvasStore.cacheLayerDom(data.id, targetRef.current);
	});

	useUpdateEffect(() => {
		if (canvasStore.reloadLayerIds.includes(data.id) && renderRef.current) {
			// 强制重新加载组件
			renderRef.current.reload();
		}
	}, [data.id, canvasStore.reloadLayerIds]);

	/**
	 * 给playground调用
	 */
	const actionRef = useMemo<LayerAction>(
		() => ({
			eventSync: (data) => {
				// 接收组件事件同步
				for (const key in data) {
					if (eventHandlers.current[key]) {
						eventHandlers.current[key](
							...[...data[key].args, EventSyncCallFlag]
						);
					}
				}
			},
		}),
		[]
	);

	/**
	 * 设置隐藏
	 */
	useEffect(() => {
		if (data) {
			setHide(!!data.hide);
		}
		if (onRef) {
			onRef(data.id, actionRef);
		}
		console.log("layer data", data);
	}, [data, onRef, actionRef]);

	/**
	 * 合并props
	 */
	const componentProps = useMemo(() => {
		const mergeProps = _.merge(data.props, { $style: data.style });
		return mergeProps;
	}, [data.props, data.style]);

	/**
	 * 选中组件
	 */
	const selectHandler = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (!enable) return;

			e.stopPropagation();
			e.preventDefault();
			targetRef.current?.focus();
			if (onSelected) {
				onSelected(data, e);
			}
		},
		[data, enable, onSelected]
	);

	/**
	 * 清空鼠标事件，防止图层粘住鼠标
	 */
	const clearMouseEvent = useCallback(() => {
		canvasStore.mouseDownEvent = undefined;
	}, [canvasStore]);

	/**
	 * 组件初始化大小
	 */
	const onMount = useCallback(
		({ size, componentOptions }: ComponentMountEvent) => {
			if (componentOptions)
				canvasStore.layerComponentOptions.set(data.id, componentOptions);

			if (size && data.isFirst) {
				if (size.width !== defaultWidth || size.height !== defaultHeight) {
					console.log("layer init size", size);
					canvasStore.initLayerSize(data.id, size.width, size.height);
				}
			}
			data.isFirst = undefined;
		},
		[data, canvasStore, defaultWidth, defaultHeight]
	);

	const callbackThis = useMemo(
		() => ({
			name: data.name,
			id: data.id,
			getProps: (key?: string) =>
				key && data.props ? data.props[key] : data.props,
			setProps: (props: Record<string, any>) => {
				if (renderRef.current) {
					// 更新组件props
					renderRef.current.updateProps(props);
				}
			},
			sendMessag: (layerNames: string[], pageName?: string) => {},
		}),
		[data]
	);

	/**
	 * 事件处理
	 */
	const eventHandler = useMemo(() => {
		const handlers: Record<string, (...args: any[]) => any> = {};
		if (data.eventHandler) {
			for (const key in data.eventHandler) {
				const { buildCode, isSync } = data.eventHandler[key];
				if (buildCode) {
					const callback: (...args: any[]) => any = runCode(buildCode);
					if (typeof callback === "function") {
						// 调用事件处理函数, values是组件事件回调结果
						handlers[key] = async (...values: any[]) => {
							// 是否通过同步事件调用，防止双向同步
							const isSyncCall =
								values.length > 0 &&
								values[values.length - 1] === EventSyncCallFlag;
							if (isSyncCall) {
								// 删除最后的标识参数
								values.pop();
							}
							try {
								const returns = await callback.call(callbackThis, ...values);
								if (!isSyncCall && isSync) {
									// 执行事件同步
									syncHelper.sync({
										to: [data.id],
										data: { [key]: { args: values, returns } },
									});
								}
							} catch (e) {
								console.error(e);
							}
						};
					}
				}
			}
		}
		eventHandlers.current = handlers;
		return handlers;
	}, [data.eventHandler, callbackThis, data.id]);

	/**
	 * 图层样式
	 */
	const layerStyle = useMemo(() => {
		const scale =
			data.style.scale !== undefined ? `scale(${data.style.scale})` : "";
		const rotate =
			data.style.rotate !== undefined ? `rotate(${data.style.rotate})` : "";
		
		// 处理边框	
		const borderObj: any = {};
		const border:Border = data.style.border as any || {};
		const borderCss = `${border.borderWidth ?? 0}px ${border.borderStyle ?? "none"} ${border.borderColor || ""}`
		if (border && border.borderPosition && border.borderPosition.length !== 0 && border.borderPosition.length < 4 ) {
			border.borderPosition.forEach(pos =>{
				borderObj[`border${pos}`] = borderCss;
			});
		}else{
			borderObj[`border`] = borderCss;
		}
		borderObj["borderRadius"] = border.borderRadius ?? 0;

		const font = data.style.font as any;

		return {
			...data.style,
			border: undefined,
			font: undefined,
			...borderObj,
			...font,
			transform: `translateX(${data.style.x}px) translateY(${data.style.y}px) ${scale} ${rotate}`,
			zIndex: data.style.z,
			display: !enable && hide ? "none" : "block",
			opacity: enable && hide ? 0.1 : data.style.opacity,
			overflow: data.style.overflow || "hidden",
			...data.customStyle,
			x: undefined,
			y: undefined,
			z: undefined,
			scale: undefined,
			rotate: undefined,
		};
	}, [hide, enable, data]);

	return (
		<div
			{...restProps}
			className={styles.layer}
			ref={targetRef}
			style={layerStyle}
			onMouseDown={selectHandler}
			onMouseOut={clearMouseEvent}
			id={data.id}
		>
			<Render
				actionRef={renderRef}
				onMount={onMount}
				component={data.component}
				props={componentProps}
				events={eventHandler}
				style={{
					width: "100%",
					height: "100%",
					pointerEvents: enable && data.eventLock ? "none" : "auto",
				}}
			/>
		</div>
	);
};

export default Layer;

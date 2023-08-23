import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { cloneDeep } from "lodash-es";
import Render, { ComponentMountEvent, RenderAction } from "./Render";
import styles from "./index.module.css";
import { useMount, useUnmount, useUpdateEffect } from "ahooks";
import { useCanvasStore } from "../../hook";
import { runCode } from "@/common/util";
import { syncHelper } from "@/common/syncHelper";
import { Border } from "@/components/StyleOptions";
import { MojitoLayerEvent } from "@/config";

const EventSyncCallFlag = Symbol.for("EventSyncCallFlag");

export type LayerAction = {
	eventSync: (event?: Record<string, { args: any[]; retruns?: any }>) => void;
};

interface LayerProps extends React.HTMLAttributes<Element> {
	data: LayerInfo;
	enable?: boolean;
	hide?: boolean;
	onSelected?: (
		data: LayerInfo,
		e?: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	onRef?: (id: string, actionRef: LayerAction) => void;
	defaultSize?: { width: number; height: number };
}

const Layer: React.FC<LayerProps> = ({
	data,
	enable = false,
	onSelected,
	defaultSize,
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
	// 是否设置了onMessage事件
	const [onMessageFlag, setOnMessageFlag] = useState(false);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useMount(() => {
		// 缓存图层dom节点
		if (targetRef.current)
			canvasStore.cacheLayerDom(data.id, targetRef.current);
	});

	useUnmount(() => {
		if (eventHandlers.current[MojitoLayerEvent.onUnmount]) {
			// 调用onUnmount事件
			eventHandlers.current[MojitoLayerEvent.onUnmount]();
		}
	});

	useUpdateEffect(() => {
		if (
			canvasStore.reloadLayerIds.includes(data.id) &&
			renderRef.current &&
			enable
		) {
			// 强制重新加载组件
			renderRef.current.reload();
		}
	}, [data.id, canvasStore.reloadLayerIds, enable]);

	/**
	 * onMessage消息处理
	 */
	const messageHandler = useCallback(
		(e: any) => {
			const { layerNames, args, target } = e.detail;
			if (
				layerNames.includes(data.name) &&
				eventHandlers.current[MojitoLayerEvent.onMessage]
			) {
				// 调用事件处理函数
				eventHandlers.current[MojitoLayerEvent.onMessage](...args, target);
			}
		},
		[data]
	);

	/**
	 * 如果组件设置了onMessage才监听事件
	 */
	useEffect(() => {
		if (onMessageFlag) {
			document.addEventListener(MojitoLayerEvent.sendMessage, messageHandler);
		}
		return () =>
			document.removeEventListener(
				MojitoLayerEvent.sendMessage,
				messageHandler
			);
	}, [onMessageFlag, messageHandler]);

	/**
	 * 给playground调用,处理同步事件
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
	}, [data, onRef, actionRef]);

	/**
	 * 组件通过__updateProps方法修改props
	 */
	const callUpdateProps = useCallback(
		(props: Record<string, any>) => {
			data.props = { ...data.props, ...props };
			canvasStore.refreshLayer([data.id]);
		},
		[data, canvasStore]
	);

	/**
	 * 选中组件
	 */
	const selectHandler = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			if (!enable || loading) return;

			e.stopPropagation();
			document.body.focus();
			if (onSelected) {
				onSelected(data, e);
			}
		},
		[data, enable, onSelected, loading]
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
			setLoading(false);
			if (enable) {
				// 编辑状态
				if (componentOptions) {
					canvasStore.layerComponentOptions.set(data.id, componentOptions);
				}

				if (size && data.isFirst && defaultSize) {
					data.isFirst = undefined;
					if (
						size.width !== defaultSize.width ||
						size.height !== defaultSize.height
					) {
						console.log("layer init size", size);
						canvasStore.initLayerSize(data.id, size.width, size.height);
					}
				}
			}

			if (eventHandlers.current[MojitoLayerEvent.onMount]) {
				// 调用onMount事件
				eventHandlers.current[MojitoLayerEvent.onMount]();
			}
		},
		[data, canvasStore, enable, defaultSize]
	);

	/**
	 * 创建事件调用的this
	 */
	const callbackThis = useMemo(
		() => ({
			name: data.name,
			id: data.id,
			getProps: (key?: string) =>
				key && cloneDeep(data.props)
					? data.props
						? cloneDeep(data.props[key])
						: undefined
					: data.props,
			setProps: (props: Record<string, any>) => {
				if (renderRef.current) {
					// 更新组件props
					renderRef.current.updateProps(props);
				}
			},
			saveProps: (props: Record<string, any>) => {
				data.props = { ...data.props, ...props };
				if (renderRef.current) {
					// 更新组件props
					renderRef.current.updateProps(props);
				}
			},
			// 路由
			navigate: (to: string) => {
				navigate(to);
			},
			// 向其他组件发送消息
			sendMessage: (layerNames: string | string[], ...args: any[]) => {
				document.dispatchEvent(
					new CustomEvent(MojitoLayerEvent.sendMessage, {
						detail: {
							layerNames:
								typeof layerNames === "string" ? [layerNames] : layerNames,
							target: { name: data.name, id: data.id },
							args,
						},
					})
				);
			},
		}),
		[data, navigate]
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
		setOnMessageFlag(!!handlers[MojitoLayerEvent.onMessage]);
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
		const border: Border = (data.style.border as any) || {};
		const borderCss = `${border.borderWidth ?? 0}px ${
			border.borderStyle ?? "none"
		} ${border.borderColor || ""}`;
		if (
			border &&
			border.borderPosition &&
			border.borderPosition.length !== 0 &&
			border.borderPosition.length < 4
		) {
			border.borderPosition.forEach((pos) => {
				borderObj[`border${pos}`] = borderCss;
			});
		} else {
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

	/**
	 * 合并props
	 */
	const componentProps = useMemo(() => {
		return {
			...data.props,
			__style: layerStyle,
			__display: enable ? "editor" : "viewer",
			__updateProps: callUpdateProps,
		};
	}, [data, enable, callUpdateProps, layerStyle]);

	return (
		<div
			{...restProps}
			className={styles.layer}
			ref={targetRef}
			style={layerStyle}
			onMouseDown={enable ? selectHandler : undefined}
			onMouseUp={enable ? clearMouseEvent : undefined}
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

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
import { Md5 } from "ts-md5";
import { useNavigate } from "react-router-dom";
// import anime from 'animejs';
import _ from "lodash-es";
import { Request } from "@mojito/common/network";
import { sendDataToPage, useStateSync } from "@/common/stateTool";
import Render, { ComponentMountEvent } from "./Render";
import styles from "./index.module.css";
import { useMount, useUpdateEffect } from "ahooks";
import { useCanvasStore } from "../../hook";
import { runCode } from "@/common/util";

const request = new Request();
const evener = new EventTarget();
const eventemitter = {
	emit: (event: string) => evener.dispatchEvent(new Event(event)),
	on: evener.addEventListener.bind(this),
	off: evener.removeEventListener.bind(this),
};

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
	...restProps
}) => {
	const history = useNavigate();
	const { canvasStore } = useCanvasStore();
	const targetRef = useRef<HTMLDivElement | null>(null);
	// const currAnime = useRef<anime.AnimeInstance | undefined | null>();
	const funThis = useRef<any>(); // 事件处理的this
	const dataSourceTimer = useRef<any>();
	const [renderKey, setRenderKey] = useState(1);
	// 组件的事件处理方法
	// const [compEventHandlers, setCompEventHandlers] = useState<any>({}); // 组件事件
	const [allEventHandlers, setAllEventHandlers] = useState<any>({}); // 所有事件
	// 事件设置的props和styles
	const [eventRel, setEventRel] = useState<EventValue>({});
	// 数据源
	const [dataSource, setDataSource] = useState<any>();
	const [hide, setHide] = useState(false);
	const [dataloading, setDataloading] = useState(false);

	useMount(() => {
		if (targetRef.current)
			canvasStore.cacheLayerDom(data.id, targetRef.current);
	});

	useUpdateEffect(() => {
		if (canvasStore.reloadLayerIds.includes(data.id)) {
			// 强制重新加载组件
			setRenderKey((key) => key + 1);
		}
	}, [data.id, canvasStore.reloadLayerIds]);

	useEffect(() => {
		if (data) {
			setHide(!!data.hide);
		}
		console.log("layer data", data);
	}, [data]);

	/**
	 * 解释组件事件
	 */
	// const parseEvents = useCallback((events: LayerEvent | undefined) => {
	// 	// 事件处理
	// 	const allEvnet: any = {};
	// 	const compEvent: any = {};
	// 	// const { events } = data;
	// 	if (events) {
	// 		Object.keys(events).forEach((key) => {
	// 			let callFun: Callback | null = null;
	// 			try {
	// 				callFun = events[key].code ? buildCode(events[key].code) : null;
	// 			} catch (e) {
	// 				showHandlerError(data.name, e);
	// 			}

	// 			if (!callFun || typeof callFun !== "function") return;

	// 			allEvnet[key] = callFun;
	// 			const eventValues = Object.keys(LayerEvent).map(
	// 				(key) => LayerEvent[key]
	// 			);
	// 			if (eventValues.indexOf(key) !== -1) {
	// 				// 系统事件
	// 				//  allEvnet[key] = callFun;
	// 			} else {
	// 				compEvent[key] = (...args: any[]) => {
	// 					// 同步事件 编辑状态下不做同步
	// 					if (events[key].isSync && setEventSync) {
	// 						setEventSync({ event: key, args });
	// 						return;
	// 					}
	// 					// 调用组件的事件处理
	// 					callFun && componentEventsHandler(callFun, ...args);
	// 				};
	// 			}
	// 		});
	// 		setCompEventHandlers(compEvent);
	// 		setAllEventHandlers(allEvnet);
	// 	}
	// 	return allEvnet;
	// }, []);

	/**
	 * 请求数据源
	 */
	const requestDataSource = (
		api: string,
		method: string,
		params?: any,
		onLayerData?: Callback
	) => {
		const newParams = params || {};
		setDataloading(true);
		eventRequest(api, method, newParams)
			.then((res) => {
				setDataSource(res);
				// 数据加载完成事件处理
				if (onLayerData) {
					runEventHandler(onLayerData, res);
				}
			})
			.finally(() => {
				setDataloading(false);
			});
	};

	/**
	 * 执行事件处理方法
	 * @param callback
	 * @param args
	 */
	const runEventHandler = (callback: Callback, ...args: any[]) => {
		try {
			callback.call(createThis(), ...args);
		} catch (e) {
			showHandlerError(data.name, e);
		}
	};

	/**
	 * 组件事件处理
	 * @param callback
	 */
	const componentEventsHandler = useCallback(
		async (callback: Callback, ...args: any[]) => {
			try {
				const self = createThis();
				callback.call(self, ...args);
			} catch (e) {
				showHandlerError(data.name, e);
			}
		},
		[eventRel, data]
	);

	/**
	 * 事件处理设置props
	 */
	const setProps = useCallback(
		(props: any) => {
			eventRel.props = {
				...eventRel.props,
				...props,
			};
			setEventRel({ ...eventRel });
		},
		[eventRel]
	);

	/**
	 * 事件处理设置style
	 */
	const setStyles = useCallback(
		(styles: any) => {
			eventRel.styles = {
				...eventRel.styles,
				...styles,
			};
			setEventRel({ ...eventRel });
		},
		[eventRel]
	);

	/**
	 * 创建事件处理方法this
	 */
	const createThis = () => {
		const currArgs = mergeArgs();
		if (funThis.current) {
			funThis.current.props = currArgs.props;
			funThis.current.styles = currArgs.styles;
		} else {
			funThis.current = {
				...currArgs,
				// currAnime: enable ? anime({}) : currAnime.current,
				evener: eventemitter,
				request: eventRequest,
				// merge,
				setProps,
				setStyles,
				setHide,
				// router: history,
				goto: (screenName: string) => {
					history(`/view/${canvasStore.screenInfo?.id}`);
				},
				goBack: () => {
					history("-1");
				},
				sync: (params: { screen: string; layer?: string; data: any }) => {
					sendDataToPage(
						`/view/${canvasStore.screenInfo?.project.id}/${params.screen}`,
						{ args: [params.data] },
						params.layer
							? Md5.hashStr(
									`${canvasStore.screenInfo!.project.name}_${params.screen}_${
										params.layer
									}`
							  )
							: ""
					);
				},
				// anime: (animeParams: anime.AnimeParams) => {
				//   return anime({
				//     ...animeParams,
				//     targets: targetRef.current
				//   });
				// },
				layer: targetRef.current,
				layerId: data.id,
			};
		}
		return funThis.current;
	};

	/**
	 * 合并props和style后的值
	 */
	const mergeArgs = useMemo(() => {
		const mergeProps = _.merge(data.props, dataSource, eventRel.props);
		const mergeStyle = _.merge(data.style, eventRel.styles);
		return { props: mergeProps, styles: mergeStyle };
	}, [data.props, data.style, dataSource, eventRel]);

	/**
	 * 选中组件
	 */
	const selectHandler = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			e.stopPropagation();
			e.preventDefault();
			targetRef.current?.focus();
			if (onSelected) {
				onSelected(data, e);
			}
		},
		[data, onSelected]
	);

	/**
	 * 清空鼠标事件，防止图层粘住鼠标
	 */
	const clearMouseEvent = useCallback(()=>{
		canvasStore.mouseDownEvent = undefined;
	}, [canvasStore])

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

	const callbackThis = useMemo(()=>({
		name: data.name, 
		id: data.id, 
		getProps: (key?:string)=> key && data.props ? data.props[key] : data.props,
		setProps: (props: Record<string, any>)=>{
			data.props = { ...data.props, ...props };
				canvasStore.refreshLayer([data.id]);
		},
		sendMessag:(layerNames:string[], pageName?:string)=>{

		}
	}), [data, canvasStore])

	/**
	 * 事件处理
	 */
	const eventHandler = useMemo(() => {
		const handlers: Record<string, (...args: any[]) => any> = {};
		if (data.eventHandler) {
			for (const key in data.eventHandler) {
				const { buildCode, isSync } = data.eventHandler[key];
				if (buildCode) {
					const callback:(...args:any[])=>any = runCode(buildCode);
					if(typeof callback === "function"){
						handlers[key] = (...values: any[]) => {
							// 调用事件处理函数, values是组件事件回调结果
							try{
								const rel = callback.call(callbackThis, ...values);
								if(isSync){
									// 同步到远程的同一个页面的同一个组件
									const syncdata = {[key]: rel}
								}
							}catch(e){
								console.error(e);
							}
						};
					}
				}
			}
		}
		return handlers;
	}, [data.eventHandler, callbackThis]);

	/**
	 * 图层样式
	 */
	const layerStyle = useMemo(() => {
		const scale =
			data.style.scale !== undefined ? `scale(${data.style.scale})` : "";
		const rotate =
			data.style.rotate !== undefined ? `rotate(${data.style.rotate})` : "";
		return {
			...data.style,
			transform: `translateX(${data.style.x}px) translateY(${data.style.y}px) ${scale} ${rotate}`,
			zIndex: data.style.z,
			display: !enable && hide ? "none" : "block",
			opacity: enable && hide ? 0.2 : data.style.opacity,
			overflow: data.style.overflow || "hidden",
			x: undefined,
			y: undefined,
			z: undefined,
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
			// tabIndex={enable ? 0 : undefined}
		>
			<Render
				key={renderKey}
				onMount={onMount}
				component={data.component}
				props={mergeArgs.props}
				componentStyle={mergeArgs.styles}
				width={mergeArgs.styles.width}
				height={mergeArgs.styles.height}
				events={eventHandler}
				style={{
					width: "100%",
					height: "100%",
					pointerEvents: enable && data.eventLock ? "none" : "auto",
				}}
				componentName={data.component.name}
			/>
		</div>
	);
};

export default Layer;

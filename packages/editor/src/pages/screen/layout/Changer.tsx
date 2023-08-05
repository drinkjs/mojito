import {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import Moveable, {
	OnDrag,
	OnDragEnd,
	OnDragGroup,
	OnDragGroupEnd,
	OnDragGroupStart,
	OnDragStart,
	OnResize,
	OnResizeEnd,
	OnResizeGroup,
	OnResizeGroupEnd,
	OnResizeGroupStart,
	OnResizeStart,
	RectInfo,
} from "react-moveable";
import { flushSync } from "react-dom";
import * as transformParser from "transform-parser";
import { useCanvasStore } from "../hook";
import { useUpdateEffect } from "ahooks";

type FrameInfo = {
	layerId: string;
	style: ComponentStyle;
};

export type ChangerAction = {
	updateRect: () => void;
	getRect: () => RectInfo | undefined;
	move: (x: number, y: number) => void;
};

interface ChangerProps {
	changerActionRef: React.MutableRefObject<ChangerAction | undefined>;
}

function formatTransform(
	transform: CSSStyleDeclaration["transform"],
	x?: number,
	y?: number
) {
	const transformObj = transformParser.parse(transform);
	if (x !== undefined) {
		transformObj.translateX = x;
	}
	if (y !== undefined) {
		transformObj.translateY = y;
	}

	return transformParser.stringify(transformObj);
}

let timer:any

export default function Changer({ changerActionRef }: ChangerProps) {
	const ref = useRef<Moveable | null>(null);
	const { canvasStore } = useCanvasStore();
	const [groupframes, setGroupFrames] = useState<FrameInfo[]>([]); // 图层组位置信息
	const [groupElement, setGroupElement] = useState<HTMLElement[]>([]); // 图层组dom
	// 组件加裁中不可选
	const [componentLoading, setComponentLoading] = useState(false);

	const { screenInfo } = canvasStore;

	const updateAll = useCallback(() => {
		const ids: string[] = [];
		const styles: ComponentStyle[] = [];
		groupframes.forEach((layerFrame) => {
			ids.push(layerFrame.layerId);
			styles.push(layerFrame.style);
		});
		// 更新图层
		canvasStore.updateLayerStyle(ids, styles);
	}, [groupframes, canvasStore]);

	useImperativeHandle(
		changerActionRef,
		() => ({
			updateRect: () => {
				ref.current!.updateRect();
			},
			getRect: () => {
				return ref.current!.getRect();
			},
			move: (x: number, y: number) => {
				groupframes.forEach((v, index) => {
					v.style.x += x;
					v.style.y += y;
					groupElement[index].style.transform = formatTransform(
						groupElement[index].style.transform,
						v.style.x,
						v.style.y
					);
				});
				ref.current!.updateRect();
				if(timer){
					clearTimeout(timer);
				}
				timer = setTimeout(updateAll, 1000)
			},
		}),
		[groupframes, groupElement, updateAll]
	);
	/**
	 * 选中的图层
	 */
	useUpdateEffect(() => {
		const { selectedLayers } = canvasStore;
		setComponentLoading(false);
		if (selectedLayers.size === 0) {
			setGroupElement([]);
			setGroupFrames([]);
		} else {
			const elements: HTMLElement[] = [];
			const frames: FrameInfo[] = [];
			selectedLayers.forEach((layer) => {
				const layerElement = canvasStore.getLayerDom(layer.id);
				if (!layerElement) return;

				elements.push(layerElement);
				frames.push({
					layerId: layer.id,
					style: { ...layer.style },
				});

				if (layer.isFirst) {
					// 组件是首次加载加载需要获取组件大小，等待初始化完成才能开始做变换
					setComponentLoading(true);
				}
			});
			setGroupElement(elements);
			setGroupFrames(frames);
		}
	}, [canvasStore.selectedLayers]);

	/**
	 * 触发moveable拖动事件
	 */
	useUpdateEffect(() => {
		if (!ref.current) return;

		ref.current.stopDrag();
		if (canvasStore.mouseDownEvent) {
			// 点击图层时触发拖动
			ref.current.dragStart(canvasStore.mouseDownEvent.nativeEvent);
		}
		canvasStore.mouseDownEvent = undefined;
		ref.current.updateRect();
		if (ref.current) {
			setTimeout(() => {
				canvasStore.moveableRect = ref.current!.getRect();
			});
		}
	}, [groupElement]);

	// 计算辅助线

	const lines = useMemo(() => {
		const verLines = [0];
		const horLines = [0];
		if (screenInfo?.style && screenInfo.layers) {
			const { width, height } = screenInfo.style;
			verLines.push(width);
			horLines.push(height);
			screenInfo.layers.forEach((layer) => {
				const maxX = layer.style.x + layer.style.width;
				const maxY = layer.style.y + layer.style.height;
				verLines.push(layer.style.x, maxX, maxX - layer.style.width / 2);
				horLines.push(layer.style.y, maxY, maxY - layer.style.height / 2);
			});
		}
		return { verLines, horLines };
	}, [screenInfo]);

	/**
	 * 开始拖动群组
	 */
	const onDragGroupStart = useCallback(
		({ events }: OnDragGroupStart) => {
			events.forEach((ev, i) => {
				const frame = groupframes[i];
				ev.set([frame.style.x, frame.style.y]);
			});
		},
		[groupframes]
	);

	/**
	 * 拖动群组结束
	 */
	const onDragGroupEnd = useCallback(
		({ isDrag }: OnDragGroupEnd) => {
			canvasStore.mouseDownEvent = undefined;
			if (!isDrag) return;
			updateAll()
		},
		[canvasStore, updateAll]
	);

	/**
	 * 正在拖动群组
	 */
	const onDragGroup = useCallback(
		({ events }: OnDragGroup) => {
			events.forEach(({ target, beforeTranslate }, i) => {
				const frame = groupframes[i];
				frame.style.x = Math.round(beforeTranslate[0]);
				frame.style.y = Math.round(beforeTranslate[1]);

				target.style.transform = formatTransform(
					target.style.transform,
					frame.style.x,
					frame.style.y
				);
			});
		},
		[groupframes]
	);

	/**
	 * 开始改变组大小
	 */
	const onResizeGroupStart = useCallback(
		({ events }: OnResizeGroupStart) => {
			events.forEach((ev, i) => {
				const frame = groupframes[i];
				// Set origin if transform-orgin use %.
				ev.setOrigin(["%", "%"]);
				// If cssSize and offsetSize are different, set cssSize.
				const style = window.getComputedStyle(ev.target);
				const cssWidth = parseFloat(style.width);
				const cssHeight = parseFloat(style.height);
				ev.set([cssWidth, cssHeight]);
				// If a drag event has already occurred, there is no dragStart.
				if (ev.dragStart) {
					ev.dragStart.set([frame.style.x, frame.style.y]);
				}
			});
		},
		[groupframes]
	);

	/**
	 * 正在改变组大小
	 */
	const onResizeGroup = useCallback(
		({ events }: OnResizeGroup) => {
			events.forEach(({ target, width, height, drag }, i) => {
				const frame = groupframes[i];
				target.style.overflow = "hidden";
				frame.style.width = Math.round(width);
				frame.style.height = Math.round(height);
				frame.style.x = Math.round(drag.beforeTranslate[0]);
				frame.style.y = Math.round(drag.beforeTranslate[1]);

				target.style.transform = formatTransform(
					target.style.transform,
					frame.style.x,
					frame.style.y
				);
				target.style.width = `${width}px`;
				target.style.height = `${height}px`;
			});
		},
		[groupframes]
	);

	/**
	 * 改变组大小结束
	 */
	const onResizeGroupEnd = useCallback(
		({ isDrag, targets }: OnResizeGroupEnd) => {
			targets.forEach((target, i) => {
				target.style.overflow = groupframes[i].style.overflow || "visible";
			});
			if (!isDrag) return;
			updateAll();
		},
		[groupframes, updateAll]
	);

	/**
	 * 开始拖动
	 */
	const onDragStart = useCallback(
		(e: OnDragStart) => {
			const { set } = e;
			const layerFrame = groupframes[0];
			set([layerFrame.style.x, layerFrame.style.y]);
		},
		[groupframes]
	);

	/**
	 * 正在拖动组件
	 */
	const onDrag = useCallback(
		(e: OnDrag) => {
			const { target, beforeTranslate } = e;
			const layerFrame = groupframes[0];
			if (!layerFrame) return;

			layerFrame.style.x = Math.round(beforeTranslate[0]);
			layerFrame.style.y = Math.round(beforeTranslate[1]);

			target.style.transform = formatTransform(
				target.style.transform,
				layerFrame.style.x,
				layerFrame.style.y
			);
		},
		[groupframes]
	);

	/**
	 * 拖动结束
	 */
	const onDragEnd = useCallback(
		({ lastEvent }: OnDragEnd) => {
			const layerFrame = groupframes[0];
			canvasStore.mouseDownEvent = undefined;
			if (lastEvent && layerFrame) {
				canvasStore.updateLayerStyle(layerFrame.layerId, layerFrame.style);
			}
		},
		[canvasStore, groupframes]
	);

	/**
	 * 开始改变单个组件大小
	 */
	const onResizeStart = useCallback(
		({ setOrigin, dragStart }: OnResizeStart) => {
			setOrigin(["%", "%"]);
			const layerFrame = groupframes[0];
			if (dragStart && layerFrame) {
				dragStart.set([layerFrame.style.x, layerFrame.style.y]);
			}
		},
		[groupframes]
	);

	/**
	 * 改变组件大小
	 */
	const onResize = useCallback(
		({ target, width, height, drag }: OnResize) => {
			const layerFrame = groupframes[0];
			if (!layerFrame) return;
			const { beforeTranslate } = drag;
			layerFrame.style.x = Math.round(beforeTranslate[0]);
			layerFrame.style.y = Math.round(beforeTranslate[1]);
			layerFrame.style.width = Math.round(width);
			layerFrame.style.height = Math.round(height);
			target.style.width = `${layerFrame.style.width}px`;
			target.style.height = `${layerFrame.style.height}px`;

			target.style.transform = formatTransform(
				target.style.transform,
				layerFrame.style.x,
				layerFrame.style.y
			);
		},
		[groupframes]
	);

	/**
	 * 改变大小结束
	 */
	const onResizeEnd = useCallback(
		({ lastEvent }: OnResizeEnd) => {
			const layerFrame = groupframes[0];
			if (lastEvent && layerFrame) {
				const { drag } = lastEvent;
				layerFrame.style.x = Math.round(drag.beforeTranslate[0]);
				layerFrame.style.y = Math.round(drag.beforeTranslate[1]);
				layerFrame.style.width = Math.round(lastEvent.width);
				layerFrame.style.height = Math.round(lastEvent.height);
				// 更新图层
				canvasStore.updateLayerStyle(layerFrame.layerId, layerFrame.style);
			}
		},
		[canvasStore, groupframes]
	);

	return (
		<Moveable
			flushSync={flushSync}
			snappable
			stopPropagation
			throttleDrag={0}
			verticalGuidelines={lines.verLines}
			horizontalGuidelines={lines.horLines}
			keepRatio={false}
			ref={ref}
			target={groupElement}
			draggable={!canvasStore.isAllLock && !componentLoading}
			resizable={!canvasStore.isAllLock && !componentLoading}
			// snapGap={true}
			// snapDirections={{"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true}}
			// elementSnapDirections={{"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true}}
			// snapThreshold={5}
			onDragGroupStart={onDragGroupStart}
			onDragGroup={onDragGroup}
			onDragGroupEnd={onDragGroupEnd}
			onResizeGroupStart={onResizeGroupStart}
			onResizeGroup={onResizeGroup}
			onResizeGroupEnd={onResizeGroupEnd}
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
			onResizeStart={onResizeStart}
			onResize={onResize}
			onResizeEnd={onResizeEnd}
		/>
	);
}

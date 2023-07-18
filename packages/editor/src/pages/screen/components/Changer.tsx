import { useCallback, useRef, useState } from "react";
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
} from "react-moveable";
import { flushSync } from "react-dom";
import * as transformParser from "transform-parser";
import { useCanvasStore } from "../hook";
import { useUpdateEffect } from "ahooks";

type FrameInfo = {
	layerId: string;
	style: ComponentStyle;
};

interface ChangerProps {
	moveableRef?: React.LegacyRef<Moveable>;
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

export default function Changer({ moveableRef }: ChangerProps) {
	// const moveableRef = useRef<Moveable | null>(null);
	const currNativeEvent = useRef<any>();
	const { canvasStore } = useCanvasStore();
	const [groupframes, setGroupFrames] = useState<FrameInfo[]>([]); // 图层组位置信息
	const [groupElement, setGroupElement] = useState<HTMLElement[]>([]); // 图层组dom
	/**
	 * 选中的图层
	 */
	useUpdateEffect(() => {
		const { selectedLayerIds, layerGroup } = canvasStore;
		if (selectedLayerIds.size === 0) {
			setGroupElement([]);
			setGroupFrames([]);
			canvasStore.setCurrLayer(undefined);
		} else {
			setGroupElement(layerGroup.map((v) => document.getElementById(v.id)!));
			setGroupFrames(
				layerGroup.map((layer) => {
					return {
						layerId: layer.id,
						style: { ...layer.style },
					};
				})
			);

			if (selectedLayerIds.size > 1) {
				canvasStore.setCurrLayer(undefined);
				// 判断是否选中的图层是在同一个群组，主要用于右上角图标显示状态
				// const groupSet = new Set<string>();
				// layerGroups.forEach((v, index) => {
				// 	groupSet.add(v.group || `${index}`);
				// });
			} else {
				// 只选中了一个图层
				if (layerGroup.length === 0) {
					canvasStore.setCurrLayer(undefined);
				} else {
					canvasStore.setCurrLayer(layerGroup[0]);
				}
			}
		}
	}, [canvasStore.selectedLayerIds]);

	// 计算辅助线
	const verLines = [0];
	const horLines = [0];

	const saveGroup = () => {
		console.log("saveGroup");
	};

	/**
	 * 开始拖动群组
	 */
	const onDragGroupStart = useCallback(({ events }: OnDragGroupStart) => {
		canvasStore.setResizeing(true);
		events.forEach((ev, i) => {
			const frame = groupframes[i];
			ev.set([frame.style.x, frame.style.y]);
		});
	}, [canvasStore, groupframes]);

	/**
	 * 拖动群组结束
	 */
	const onDragGroupEnd = useCallback(({ isDrag }: OnDragGroupEnd) => {
		currNativeEvent.current = null;
		canvasStore.setResizeing(false);
		if (!isDrag) return;
		saveGroup();
	}, [canvasStore]);

	/**
	 * 正在拖动群组
	 */
	const onDragGroup = useCallback(({ events }: OnDragGroup) => {
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
	}, [groupframes]);

	/**
	 * 开始改变组大小
	 */
	const onResizeGroupStart = useCallback(({ events }: OnResizeGroupStart) => {
		canvasStore.setResizeing(true);
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
	}, [canvasStore, groupframes]);

	/**
	 * 正在改变组大小
	 */
	const onResizeGroup = useCallback(({ events }: OnResizeGroup) => {
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
	}, [groupframes]);

	/**
	 * 改变组大小结束
	 */
	const onResizeGroupEnd = useCallback(
		({ isDrag, targets }: OnResizeGroupEnd) => {
			targets.forEach((target, i) => {
				target.style.overflow = groupframes[i].style.overflow || "visible";
			});
			canvasStore.setResizeing(false);
			if (!isDrag) return;
			saveGroup();
		},
		[canvasStore, groupframes]
	);

	/**
	 * 开始拖动
	 */
	const onDragStart = useCallback((e: OnDragStart) => {
		const { set } = e;
		const layerFrame = groupframes[0];
		set([layerFrame.style.x, layerFrame.style.y]);
	}, [groupframes]);

	/**
	 * 正在拖动组件
	 */
	const onDrag = useCallback((e: OnDrag) => {
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
	}, [groupframes]);

	/**
	 * 拖动结束
	 */
	const onDragEnd = useCallback(({ lastEvent }: OnDragEnd) => {
		const layerFrame = groupframes[0];
		currNativeEvent.current = null;
		if (lastEvent && layerFrame) {
			canvasStore.updateLayer(layerFrame.layerId, {
				style: {
					...canvasStore.currLayer?.style,
					...layerFrame.style,
				},
			});
		}
	}, [canvasStore, groupframes]);

	/**
	 * 开始改变单个组件大小
	 */
	const onResizeStart = useCallback(
		({ setOrigin, dragStart }: OnResizeStart) => {
			setOrigin(["%", "%"]);
			const layerFrame = groupframes[0];
			canvasStore.setResizeing(true);
			if (dragStart && layerFrame) {
				dragStart.set([layerFrame.style.x, layerFrame.style.y]);
			}
		},
		[canvasStore, groupframes]
	);

	/**
	 * 改变组件大小
	 */
	const onResize = useCallback(({ target, width, height, drag }: OnResize) => {
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
	}, [groupframes]);

	/**
	 * 改变大小结束
	 */
	const onResizeEnd = useCallback(({ lastEvent }: OnResizeEnd) => {
		const layerFrame = groupframes[0];
		if (lastEvent && layerFrame) {
			const { drag } = lastEvent;
			layerFrame.style.x = Math.round(drag.beforeTranslate[0]);
			layerFrame.style.y = Math.round(drag.beforeTranslate[1]);
			layerFrame.style.width = Math.round(lastEvent.width);
			layerFrame.style.height = Math.round(lastEvent.height);
			// 更新图层
			canvasStore.updateLayer(layerFrame.layerId, {
				style: {
					...canvasStore.currLayer?.style,
					...layerFrame.style,
				},
			});
		}
		canvasStore.setResizeing(false);
	}, [canvasStore, groupframes]);

	return (
		<Moveable
			flushSync={flushSync}
			rootContainer={document.body}
			snappable
			throttleDrag={0}
			verticalGuidelines={verLines}
			horizontalGuidelines={horLines}
			keepRatio={false}
			ref={moveableRef}
			target={canvasStore.playing ? [] : groupElement}
			draggable={!canvasStore.isLayerLock}
			resizable={!canvasStore.isLayerLock}
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

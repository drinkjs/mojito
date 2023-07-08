import { useDebounceFn, useDocumentVisibility, useMount, useUpdateEffect } from "ahooks";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Moveable from "react-moveable";
import { flushSync } from "react-dom";
import * as transformParser from "transform-parser";
import { useCanvasStore } from "../hook";
import styles from "../styles/playground.module.css";
import Layer from "./Layer";

const DefaultPageSize = { width: 1920, height: 1080 };

interface FrameInfo {
	layerId: string;
	style: ComponentStyle;
}

const DefaulBackgroundColor = "#FFF";
const DefaultFontColor = "#000";
let compCount: { [key: string]: number } = {};

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

export default function Playground() {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const areaRef = useRef<HTMLDivElement | null>(null);
	const zoomRef = useRef<HTMLDivElement | null>(null);
	const moveableRef = useRef<Moveable | null>(null);
	const { canvasStore } = useCanvasStore();
	// const currLayerIds = useRef<Set<string>>(new Set()); // 选中的图层id
	const currNativeEvent = useRef<any>();
	const [groupframes, setGroupFrames] = useState<FrameInfo[]>([]); // 图层组位置信息
	const [groupElement, setGroupElement] = useState<HTMLElement[]>([]); // 图层组dom
	const [areaOffset, setAreaOffset] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	const documentVisibility = useDocumentVisibility();
	const { scale, screenInfo } = canvasStore;

	const pageLayout = screenInfo ? screenInfo.style : undefined;
	console.log("===========================================", pageLayout)

	const screenLayers = canvasStore.layers;
	const currLayerIds = canvasStore.selectedLayerIds;

	useLayoutEffect(()=>{
		if(!canvasStore.rootElement){
			canvasStore.rootElement = rootRef.current;
			canvasStore.areaElement = areaRef.current;
			canvasStore.zoomElement = zoomRef.current;
		}
	}, [pageLayout])

	// 防抖
	const debounceRect = useDebounceFn(() => {
		if(moveableRef.current){
			const rect = moveableRef.current.getRect();
			canvasStore.moveableRect = {
				x: Math.round(rect.left),
				y: Math.round(rect.top),
				width: Math.round(rect.width),
				height: Math.round(rect.height),
			};
		}
	});

	/**
	 * 选中的图层
	 */
	useUpdateEffect(() => {
		if (currLayerIds.size === 0) {
			setGroupElement([]);
			setGroupFrames([]);
			canvasStore.setCurrLayer(undefined);
		} else {
			const layerGroups = canvasStore.layerGroup;

			setGroupElement(layerGroups.map((v) => document.getElementById(v.id)!));
			setGroupFrames(
				layerGroups.map((layer) => {
					return {
						layerId: layer.id,
						style: { ...layer.style },
					};
				})
			);

			if (currLayerIds.size > 1) {
				canvasStore.setCurrLayer(undefined);
				// 判断是否选中的图层是在同一个群组，主要用于右上角图标显示状态
				// const groupSet = new Set<string>();
				// layerGroups.forEach((v, index) => {
				// 	groupSet.add(v.group || `${index}`);
				// });
			} else {
				// 只选中了一个图层
				if (layerGroups.length === 0) {
					canvasStore.setCurrLayer(undefined);
				} else {
					canvasStore.setCurrLayer(layerGroups[0]);
				}
			}
		}
	}, [canvasStore.selectedLayerIds]);

	/**
	 * 更新moveable
	 */
	const updateRect = useCallback(() => {
		if (moveableRef.current) {
			moveableRef.current.updateRect();
			debounceRect.run();
		}
	}, []);

	/**
	 * 取消所有选中
	 */
	const onEmptyClick = useCallback(() => {
		console.log("======onEmptyClick====");
	}, []);

	const saveGroup = useCallback(() => {
		console.log("saveGroup");
	}, []);

	/**
	 * 选中图层
	 */
	const onSelectLayer = useCallback(
		(
			layerData: LayerInfo,
			event?: React.MouseEvent<HTMLDivElement, MouseEvent>
		) => {
			console.log("onSelectLayer", layerData);
			if (canvasStore.selectedLayerIds.has(layerData.id)) return;

			currNativeEvent.current = event ? event.nativeEvent : null;
			const ids = canvasStore.selectedLayerIds;
			if (!event || !event.ctrlKey) {
				ids.clear();
			}
			let currGroupLayers = [layerData];
			if (layerData.group && canvasStore.layers) {
				// 找出所有同组图层
				currGroupLayers = canvasStore.layers.filter(
					(v) => v.group === layerData.group
				);
			}
			// 当前点击的图层及与之群组的图层
			currGroupLayers.forEach((v) => {
				ids.add(v.id);
			});
			canvasStore.selectedLayerIds = new Set(ids);
		},
		[]
	);

	/**
	 * 图层初始化完成
	 */
	const onLayerInit = useCallback((layer: LayerInfo) => {
		console.log("onLayerInit");
		if (canvasStore.currLayer && canvasStore.currLayer.id === layer.id) {
			onSelectLayer(layer);
			updateRect();
		}
	}, []);

	compCount = {};
	// 计算辅助线
	const verLines = [0];
	const horLines = [0];

	return (
		<main className={styles.playground} onMouseDown={onEmptyClick} tabIndex={0}>
			<div className={styles.area} ref={areaRef}>
				<div ref={zoomRef} style={{ margin: "auto" }}>
					{pageLayout && (
						<div
							style={{
								...pageLayout,
								backgroundColor:
									pageLayout.backgroundColor || DefaulBackgroundColor,
								backgroundImage: pageLayout.backgroundImage
									? `url(${pageLayout.backgroundImage})`
									: "none",
								color: pageLayout.color || DefaultFontColor,
								backgroundSize:
									pageLayout.backgroundRepeat === "no-repeat"
										? "100% 100%"
										: undefined,
								backgroundRepeat: pageLayout.backgroundRepeat,
								position: "relative",
								boxShadow: "3px 3px 15px rgb(0 0 0 / 15%)",
								zIndex: 1,
							}}
							ref={rootRef}
						>
							{screenLayers &&
								screenLayers.map((v) => {
									if (!v.component) return null;

									if (!compCount[v.component.name]) {
										compCount[v.component.name] = 1;
									} else {
										compCount[v.component.name] += 1;
									}
									const layerData = v;
									return (
										<Layer
											enable
											defaultWidth={300}
											defaultHeight={200}
											data={layerData}
											key={`${layerData.id}_${layerData.reloadKey}`}
											onSelected={onSelectLayer}
											onReady={onLayerInit}
										/>
									);
								})}
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
								onDragGroupStart={({ events }) => {
									canvasStore.setResizeing(true);
									events.forEach((ev, i) => {
										const frame = groupframes[i];
										ev.set([frame.style.x, frame.style.y]);
									});
								}}
								onDragGroup={({ events }) => {
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
								}}
								onDragGroupEnd={({ isDrag }) => {
									currNativeEvent.current = null;
									canvasStore.setResizeing(false);
									if (!isDrag) return;
									saveGroup();
								}}
								onResizeGroupStart={({ events }) => {
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
								}}
								onResizeGroup={({ events }) => {
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
								}}
								onResizeGroupEnd={({ isDrag, targets }) => {
									targets.forEach((target, i) => {
										target.style.overflow =
											groupframes[i].style.overflow || "visible";
									});
									canvasStore.setResizeing(false);
									if (!isDrag) return;
									saveGroup();
								}}
								onDragStart={(e) => {
									const { set } = e;
									const layerFrame = groupframes[0];
									set([layerFrame!.style.x, layerFrame!.style.y]);
								}}
								onDrag={(e) => {
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
								}}
								onDragEnd={({ lastEvent }) => {
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
								}}
								onResizeStart={({ setOrigin, dragStart }) => {
									setOrigin(["%", "%"]);
									const layerFrame = groupframes[0];
									canvasStore.setResizeing(true);
									if (dragStart && layerFrame) {
										dragStart.set([layerFrame.style.x, layerFrame.style.y]);
									}
								}}
								onResize={({ target, width, height, drag }) => {
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
								}}
								onResizeEnd={({ lastEvent }) => {
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
												...canvasStore.currLayer!.style,
												...layerFrame.style,
											},
										});
									}
									canvasStore.setResizeing(false);
								}}
							/>
						</div>
					)}
				</div>
			</div>
			{/* <ConnectedMenu /> */}
			{/* {contextHolder} */}
		</main>
	);
}

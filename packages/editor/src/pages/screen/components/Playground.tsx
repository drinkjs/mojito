import {
	useDebounceFn,
	useDocumentVisibility,
	useMount,
	useUpdateEffect,
} from "ahooks";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import Moveable from "react-moveable";
import { v4 as uuidv4 } from "uuid";
import * as transformParser from "transform-parser";
import { useCanvasStore } from "../hook";
import styles from "../styles/playground.module.css";
import Layer from "./Layer";
import { DefaultLayerSize } from "@/config";
import Changer from "./Changer";


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
	const { canvasStore } = useCanvasStore();
	const rootRef = useRef<HTMLDivElement | null>(null);
	const areaRef = useRef<HTMLDivElement | null>(null);
	const zoomRef = useRef<HTMLDivElement | null>(null);
	const moveableRef = useRef<Moveable | null>(null);
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
	console.log("===========================================", pageLayout);

	const screenLayers = canvasStore.layers;
	const currLayerIds = canvasStore.selectedLayerIds;

	const [, dropTarget] = useDrop(() => ({
		accept: "ADD_COMPONENT",
		drop: (item: any, monitor) => {
			const { value } = item;
			let x = 0;
			let y = 0;

			// 计算放下的位置
			const offset = monitor.getClientOffset();
			if (offset && rootRef.current) {
				const dropTargetXy = rootRef.current.getBoundingClientRect();
				x = (offset.x - dropTargetXy.left) / scale;
				y = (offset.y - dropTargetXy.top) / scale;
			}

			if (!compCount[value.name]) {
				compCount[value.name] = 1;
			} else {
				compCount[value.name] += 1;
			}

			const z =
				canvasStore.layers && canvasStore.layers.length
					? canvasStore.layers[0].style.z + 1
					: 1;

			x = Math.round(x - DefaultLayerSize.width / 2);
			y = Math.round(y - DefaultLayerSize.height / 2);
			// 新图层
			if (canvasStore && canvasStore.screenInfo) {
				const newLayer: LayerInfo = {
					name: `${value.title}${compCount[value.name]}`,
					component: value,
					initSize: false,
					eventLock: true,
					style: {
						x,
						y,
						z,
						width: DefaultLayerSize.width,
						height: DefaultLayerSize.height,
					},
					id: uuidv4(),
				};

				canvasStore.addLayer(newLayer);
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	}));

	useLayoutEffect(() => {
		if (!canvasStore.rootElement) {
			canvasStore.rootElement = rootRef.current;
			canvasStore.areaElement = areaRef.current;
			canvasStore.zoomElement = zoomRef.current;
			dropTarget(rootRef)
		}
	}, [pageLayout, canvasStore, dropTarget]);

	// 防抖
	const debounceRect = useDebounceFn(() => {
		if (moveableRef.current) {
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

;

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
							
						</div>
					)}
				</div>
			</div>
			{/* <ConnectedMenu /> */}
			{/* {contextHolder} */}
			<Changer moveableRef={moveableRef} />
		</main>
	);
}

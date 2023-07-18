import {
	useDebounceFn,
	useDocumentVisibility,
} from "ahooks";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import Moveable from "react-moveable";
import { useCanvasStore } from "../hook";
import styles from "../styles/playground.module.css";
import Layer from "./Layer";
import { DefaultLayerSize } from "@/config";
import Changer from "./Changer";

const DefaulBackgroundColor = "#FFF";
const DefaultFontColor = "#000";

export default function Playground() {
	const { canvasStore } = useCanvasStore();
	// 相同组件的数量,主要为了新增图层时自动名称
	const compCount = useRef<{ [key: string]: number }>({}).current
	const rootRef = useRef<HTMLDivElement | null>(null);
	const areaRef = useRef<HTMLDivElement | null>(null);
	const zoomRef = useRef<HTMLDivElement | null>(null);
	const moveableRef = useRef<Moveable | null>(null);
	const [defaultLayerSize, setDefaultLayerSize] = useState({width:300, height:200});
	// const currLayerIds = useRef<Set<string>>(new Set()); // 选中的图层id
	const currNativeEvent = useRef<any>();
	const [areaOffset, setAreaOffset] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	const documentVisibility = useDocumentVisibility();
	const { scale, screenInfo, layers } = canvasStore;

	const pageLayout = screenInfo ? screenInfo.style : undefined;

	useEffect(()=>{
		if(pageLayout){
			const width = Math.round(pageLayout.width * 0.1);
			const height = Math.round(width * (2 / 3));
			setDefaultLayerSize({width, height})
		}
	}, [pageLayout])

	const [, dropTarget] = useDrop(() => ({
		accept: "ADD_COMPONENT",
		drop: (item: {export:string, name:string, scriptUrl:string, external:any, packId:string}, monitor) => {
			const { name, scriptUrl, external, packId } = item;
			let x = 0;
			let y = 0;

			// 计算放下的位置
			const offset = monitor.getClientOffset();
			if (offset && rootRef.current) {
				const dropTargetXy = rootRef.current.getBoundingClientRect();
				x = (offset.x - dropTargetXy.left) / scale;
				y = (offset.y - dropTargetXy.top) / scale;
			}

			if (!compCount[name]) {
				compCount[name] = 1;
			} else {
				compCount[name] += 1;
			}

			const z =
				canvasStore.layers && canvasStore.layers.length
					? canvasStore.layers[0].style.z + 1
					: 1;
			// 计算图层落下的位置
			x = Math.round(x - DefaultLayerSize.width / 2);
			y = Math.round(y - DefaultLayerSize.height / 2);
			// 新图层
			if (canvasStore && canvasStore.screenInfo) {
				const newLayer: LayerInfo = {
					id: Date.now().toString(36),
					name: `${name}${compCount[name]}`,
					component: {
						export: item.export,
						name,
						packId,
					},
					initSize: false,
					eventLock: true,
					style: {
						x,
						y,
						z,
						width: DefaultLayerSize.width,
						height: DefaultLayerSize.height,
					},
				};

				canvasStore.addLayer(newLayer, scriptUrl, external);
			}
		},
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	}));

	useEffect(() => {
		if (!canvasStore.rootElement) {
			canvasStore.rootElement = rootRef.current;
			canvasStore.areaElement = areaRef.current;
			canvasStore.zoomElement = zoomRef.current;
			dropTarget(rootRef)
		}
	}, [canvasStore, dropTarget]);

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
	 * 更新moveable
	 */
	const updateRect = useCallback(() => {
		if (moveableRef.current) {
			moveableRef.current.updateRect();
			debounceRect.run();
		}
	}, [debounceRect]);

	/**
	 * 取消所有选中
	 */
	const onEmptyClick = useCallback(() => {
		console.log("======onEmptyClick====");
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
		[canvasStore]
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
	}, [canvasStore, onSelectLayer, updateRect]);

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
							{layers &&
								layers.map((v) => {
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
											defaultWidth={defaultLayerSize.width}
											defaultHeight={defaultLayerSize.height}
											data={layerData}
											key={layerData.id}
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

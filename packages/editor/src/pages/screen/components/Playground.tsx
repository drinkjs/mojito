import {
	useDebounceFn,
	useDocumentVisibility,
	useInterval,
	useKeyPress,
	useMount,
	useSize,
	useUpdateEffect,
} from "ahooks";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { useDrop } from "react-dnd";
import { useCanvasStore } from "../hook";
import styles from "../styles/playground.module.css";
import Layer from "./Layer";
import { DefaultLayerSize } from "@/config";
import Changer, { ChangerAction } from "./Changer";
import { Modal } from "antd";
import { smallId } from "@/common/util";

const DefaulBackgroundColor = "#FFF";
const DefaultFontColor = "#000";

const MoveKeys = ["UpArrow", "DownArrow", "LeftArrow", "RightArrow"];
const ActionKeys = ["esc", "delete", "ctrl.h", "ctrl.l", "ctrl.g", "ctrl.b"];
const LayersKeys = ["ctrl.z", "ctrl.y", "ctrl.s"]

export default function Playground() {
	const { canvasStore } = useCanvasStore();
	const [modal, contextHolder] = Modal.useModal();
	// 相同组件的数量,主要为了新增图层时自动名称
	const compCount = useRef<{ [key: string]: number }>({}).current;
	const layoutRef = useRef<HTMLDivElement | null>(null);
	const areaRef = useRef<HTMLDivElement | null>(null);
	const zoomRef = useRef<HTMLDivElement | null>(null);
	const changerRef = useRef<ChangerAction>();
	const [defaultLayerSize, setDefaultLayerSize] = useState({
		width: 300,
		height: 200,
	});
	const [areaOffset, setAreaOffset] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [actioning, setActioning] = useState(false);
	const documentVisibility = useDocumentVisibility();

	const { scale, screenInfo, layers } = canvasStore;
	const pageLayout = screenInfo ? screenInfo.style : undefined;

	const debounceRect = useDebounceFn(() => {
		if (changerRef.current) {
			const rect = changerRef.current.getRect();
			if (rect) {
				canvasStore.moveableRect = {
					x: Math.round(rect.left),
					y: Math.round(rect.top),
					width: Math.round(rect.width),
					height: Math.round(rect.height),
				};
			}
		}
	});
	
	/**
	 * 更新moveable
	 */
	const updateRect = useCallback(() => {
		if (changerRef.current) {
			changerRef.current.updateRect();
			debounceRect.run();
		}
	}, [debounceRect]);


	useUpdateEffect(() => {
		updateRect();
	}, [scale]);

	/**
	 * 定时保存图层信息
	 */
	useInterval(() => {
		if (documentVisibility === "visible") {
			canvasStore.saveScreen();
		}
	}, 5000);

	/**
	 * 根据页面大小设置默认图层大小
	 */
	useEffect(() => {
		if (pageLayout) {
			const width = Math.round(pageLayout.width * 0.1);
			const height = Math.round(width * (2 / 3));
			setDefaultLayerSize({ width, height });
		}
	}, [pageLayout]);

	/**
	 * 接受拖入
	 */
	const [, dropTarget] = useDrop(
		() => ({
			accept: "ADD_COMPONENT",
			drop: (
				item: {
					export: string;
					name: string;
					scriptUrl: string;
					external: any;
					packId: string;
				},
				monitor
			) => {
				const { name, scriptUrl, external, packId } = item;
				let x = 0;
				let y = 0;

				// 计算放下的位置
				const offset = monitor.getClientOffset();
				if (offset && layoutRef.current) {
					const dropTargetXy = layoutRef.current.getBoundingClientRect();
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
						? canvasStore.layers[canvasStore.layers.length - 1].style.z + 1
						: 1;
				// 计算图层落下的位置
				x = Math.round(x - DefaultLayerSize.width / 2);
				y = Math.round(y - DefaultLayerSize.height / 2);
				// 新图层
				if (canvasStore && canvasStore.screenInfo) {
					const newLayer: LayerInfo = {
						id: smallId(),
						isFirst: true,
						name: `${name}${compCount[name]}`,
						component: {
							export: item.export,
							name,
							packId,
						},
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
		}),
		[scale]
	);

	/**
	 * 页面构建完成
	 */
	useMount(() => {
		canvasStore.layoutContainer = layoutRef.current;
		canvasStore.areaElement = areaRef.current;
		canvasStore.zoomElement = zoomRef.current;
		canvasStore.zoomAuto();
		dropTarget(layoutRef);
	});

	/**
	 * 页面大小改变时更新moveable位置
	 */
	const size = useSize(areaRef);
	useUpdateEffect(()=>{
		updateRect()
	}, [size, updateRect])

	/**
	 * 键盘移动图层
	 */
	useKeyPress(
		MoveKeys,
		(event) => {
			if (canvasStore.selectedLayers.size === 0 || !changerRef.current) return;
			event.preventDefault();
			let valueX = 0;
			let valueY = 0;
			switch (event.key) {
				case "ArrowUp":
					valueY = -1;
					break;
				case "ArrowDown":
					valueY = 1;
					break;
				case "ArrowLeft":
					valueX = -1;
					break;
				case "ArrowRight":
					valueX = 1;
					break;
			}
			changerRef.current.move(valueX, valueY);
		},
		{ useCapture: true }
	);

	/**
	 * 删除和取消选择
	 */
	useKeyPress(
		ActionKeys,
		(event) => {
			if (canvasStore.selectedLayers.size === 0) return;

			event.preventDefault();
			console.log(event.key);
			switch (event.key) {
				case "Escape":
					// 取消选中
					canvasStore.selectedLayers = new Set();
					break;
				case "Delete":
					setActioning(true);
					modal.confirm({
						title: "确定删除?",
						onOk: () => {
							canvasStore.deleteLayer();
							setActioning(false);
						},
						onCancel: () => {
							setActioning(false);
						},
					});
					break;
				case "g":
					// 群组选中的图层
					canvasStore.groupLayer();
					break;
				case "b":
					// 取消群组
					canvasStore.disbandGroup();
					break;
				case "l":
					// 锁定图层
					canvasStore.lockLayer(!canvasStore.isAllLock);
					break;
			}
		},
		{ useCapture: true, exactMatch: true }
	);

	useKeyPress(LayersKeys, (event)=>{
		event.preventDefault();
	}, { useCapture: true, exactMatch: true })

	/**
	 * 取消所有选中
	 */
	const clearAllSelected = useCallback(() => {
		if (!actioning) canvasStore.selectedLayers = new Set();
	}, [canvasStore, actioning]);

	/**
	 * 选中图层
	 */
	const onSelectLayer = useCallback(
		(
			layer: LayerInfo,
			event?: React.MouseEvent<HTMLDivElement, MouseEvent>
		) => {
			canvasStore.mouseDownEvent = event;
			canvasStore.selectLayer(layer, event && event.ctrlKey);
		},
		[canvasStore]
	);

	return (
		<main
			className={styles.playground}
			// onMouseDown={clearAllSelected}
			tabIndex={0}
		>
			<div className={styles.area} ref={areaRef}>
				<div ref={zoomRef} style={{ margin: "auto" }}>
					<Changer changerActionRef={changerRef} />
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
							ref={layoutRef}
						>
							{layers &&
								layers.map((v) => {
									if (!v.component) return null;

									if (!compCount[v.component.name]) {
										compCount[v.component.name] = 1;
									} else {
										compCount[v.component.name] += 1;
									}

									return (
										<Layer
											enable
											defaultWidth={defaultLayerSize.width}
											defaultHeight={defaultLayerSize.height}
											data={v}
											key={v.id}
											onSelected={onSelectLayer}
										/>
									);
								})}
						</div>
					)}
				</div>
			</div>
			{/* <ConnectedMenu /> */}
			{contextHolder}
		</main>
	);
}

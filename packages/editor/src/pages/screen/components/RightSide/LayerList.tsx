import IconFont from "@/components/IconFont";
import { Modal, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";
import { useDebounceFn } from "ahooks";

export default function LayerList() {
	const { canvasStore } = useCanvasStore();
	const [modal, contextHolder] = Modal.useModal();
	const [layers, setLayers] = useState(canvasStore.layers);

	useEffect(() => {
		setLayers(canvasStore.layers);
	}, [canvasStore.layers]);
	/**
	 * 隐藏图层
	 */
	const onHide = useCallback(
		(layer: LayerInfo) => {
			canvasStore.hideLayer(!layer.hide, layer);
		},
		[canvasStore]
	);

	/**
	 * 锁定图层
	 */
	const onLock = useCallback(
		(layer: LayerInfo) => {
			canvasStore.lockLayer(!layer.lock, layer);
		},
		[canvasStore]
	);

	/**
	 * 选中图层
	 */
	const onLayerClick = useCallback(
		(layer: LayerInfo, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			event.stopPropagation();
			canvasStore.selectLayer(layer, event.ctrlKey);
		},
		[canvasStore]
	);

	/**
	 * 删除图层
	 */
	const onRemove = useCallback(
		(layer: LayerInfo) => {
			modal.confirm({
				title: `确定删除${layer.name}?`,
				onOk: () => {
					canvasStore.deleteLayer(layer);
				},
				// onCancel: () => {}
			});
		},
		[canvasStore, modal]
	);

	/**
	 * 正在拖动
	 */
	const moveCard = useCallback(
		(dragItem: DragItem, dropItem: DragItem) => {
			const { index: dragIndex } = dragItem;
			const { index: hoverIndex } = dropItem;
			const layer = layers[dragIndex];
			layers.splice(dragIndex, 1);
			layers.splice(hoverIndex, 0, layer);
			setLayers([...layers]);
		},
		[layers]
	);

	/**
	 * 拖动结束
	 */
	const onDragEnd = useCallback(
		(didDrop: boolean) => {
			let maxZ = layers.length + 1;
			layers.forEach((layer) => {
				layer.style.z = maxZ;
				maxZ--;
			});
			canvasStore.refreshLayer();
		},
		[layers, canvasStore]
	);

	const { run } = useDebounceFn(
		(layer: LayerInfo, newName: string) => {
			layer.name = newName;
			canvasStore.refreshLayer();
		},
		{
			wait: 100,
		}
	);

	return (
		<section className={styles.settingRoot}>
			<DndProvider backend={HTML5Backend}>
				{layers.map((layer, index) => {
					return (
						<LayerItem
							key={layer.id}
							value={layer}
							onHide={onHide}
							onLock={onLock}
							onMove={moveCard}
							onClick={onLayerClick}
							onRemove={onRemove}
							dragEnd={onDragEnd}
							onChangeName={run}
							index={index}
							selected={canvasStore.selectedLayers.has(layer)}
						/>
					);
				})}
			</DndProvider>
			{contextHolder}
		</section>
	);
}

interface LayerItemProps {
	value: LayerInfo;
	onHide: (layer: LayerInfo) => void;
	onLock: (layer: LayerInfo) => void;
	onRemove: (layer: LayerInfo) => void;
	onClick: (
		layer: LayerInfo,
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	onMove: (dragIndex: DragItem, hoverIndex: DragItem) => void;
	dragEnd: (didDrop: boolean) => void;
	onChangeName: (layer: LayerInfo, newName: string) => void;
	selected: boolean;
	index: number;
}

interface DragItem {
	index: number;
	id: string;
	type: string;
}

const ACCEPT = "DragLayerItem";

const LayerItem = ({
	value,
	onHide,
	onLock,
	onRemove,
	onClick,
	onMove,
	dragEnd,
	onChangeName,
	selected,
	index,
}: LayerItemProps) => {
	const ref = useRef<HTMLDivElement>(null);

	const [, drop] = useDrop({
		accept: ACCEPT,
		// drop: (item: DragItem) => {
		//   if (item.index === index) return;
		//   moveCard(item, {index, id:value.id, type: ACCEPT});
		// },
		hover: (item: DragItem, monitor: DropTargetMonitor) => {
			if (!ref.current) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;

			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}

			// Determine rectangle on screen
			const hoverBoundingRect = ref.current?.getBoundingClientRect();

			// Get vertical middle
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

			// Determine mouse position
			const clientOffset = monitor.getClientOffset();

			if (!clientOffset) return;

			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			// Only perform the move when the mouse has crossed half of the items height
			// When dragging downwards, only move when the cursor is below 50%
			// When dragging upwards, only move when the cursor is above 50%

			// Dragging downwards
			if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
				return;
			}

			// Dragging upwards
			if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
				return;
			}

			// Time to actually perform the action
			onMove(item, { id: value.id || "", index, type: ACCEPT });

			// Note: we're mutating the monitor item here!
			// Generally it's better to avoid mutations,
			// but it's good here for the sake of performance
			// to avoid expensive index searches.
			// eslint-disable-next-line no-param-reassign
			item.index = hoverIndex;
		},
		// collect: (monitor: any) => {
		//   return {
		//     isOver: monitor.isOver({ shallow: true }),
		//   };
		// },
	});

	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: "LAYER_LIST_ITEM",
			item: {
				type: ACCEPT,
				index,
				layerId: value.id,
			},
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
			end: (dropResult, monitor) => {
				// const { id: droppedId, originalIndex } = monitor.getItem()
				const didDrop = monitor.didDrop();
				dragEnd(didDrop);
			},
		}),
		[value]
	);

	const opacity = isDragging ? 0 : 1;
	drag(drop(ref));

	return (
		<div
			className={classNames(styles.layerListItem, {
				[styles.layerListItemSelected]: selected,
			})}
			ref={ref}
			style={{ opacity }}
		>
			<IconFont
				type="icon-suoding"
				className={styles.icons}
				style={{
					color: value.lock ? "#fff" : "#444",
					fontSize: "16px",
				}}
				onClick={() => {
					onLock(value);
				}}
			/>
			<IconFont
				type="icon-xianshi1"
				className={styles.icons}
				style={{
					right: "0",
					color: value.hide ? "#444" : "#fff",
					fontSize: "16px",
					marginLeft: 6,
				}}
				onClick={() => {
					onHide(value);
				}}
			/>
			<div
				className={styles.layerListName}
				onClick={(e) => {
					onClick(value, e);
				}}
			>
				<Typography.Text
					style={{ width: "95%" }}
					ellipsis
					editable={{
						maxLength: 100,
						enterIcon: null,
						autoSize: { maxRows: 1, minRows: 1 },
						onChange: (text: string) => onChangeName(value, text),
					}}
				>
					{value.name}
				</Typography.Text>
			</div>
			<IconFont
				type="icon-shanchu1"
				className={styles.icons}
				style={{
					right: "0",
					fontSize: "14px",
				}}
				onClick={() => {
					onRemove(value);
				}}
			/>
		</div>
	);
};

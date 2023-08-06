import IconFont from "@/components/IconFont";
import { Modal, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCanvasStore } from "../../hook";
import styles from "./index.module.css";
import { useDebounceFn } from "ahooks";

const ACCEPT = "LAYER_LIST_ITEM";

export default function LayerList() {
	const { canvasStore } = useCanvasStore();
	const [modal, contextHolder] = Modal.useModal();
	const [layers, setLayers] = useState(()=>([...canvasStore.layers]));
	// const [, drop] = useDrop(() => ({ accept: ACCEPT }));

	useEffect(() => {
		setLayers([...canvasStore.layers]);
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
		(dragItem: DragItem, hoverItem: DragItem) => {
			const dragIndex = layers.findIndex((layer) => layer.id === dragItem.id);
			const hoverIndex = layers.findIndex((layer) => layer.id === hoverItem.id);
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
			if (didDrop) {
				let maxZ = layers.length + 1;
				layers.forEach((layer) => {
					layer.style.z = maxZ;
					maxZ--;
				});
				canvasStore.layers = layers;
				canvasStore.refreshLayer();
			}
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
	onMove: (drag: DragItem, hover: DragItem) => void;
	dragEnd: (didDrop: boolean) => void;
	onChangeName: (layer: LayerInfo, newName: string) => void;
	selected: boolean;
	index: number;
}

interface DragItem {
	index: number;
	id: string;
}

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
	// 可拖动
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: ACCEPT,
			item: { id: value.id, index },
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
			end: (_, monitor) => {
				const didDrop = monitor.didDrop();
				dragEnd(didDrop);
			},
		}),
		[value, index, onMove, dragEnd]
	);
	// 可拖入
	const [, drop] = useDrop(
		() => ({
			accept: ACCEPT,
			hover(item: DragItem) {
				if (item.id !== value.id) {
					onMove(item, { index, id: value.id });
				}
			},
		}),
		[index, onMove, value]
	);

	const opacity = isDragging ? 0 : 1;

	return (
		<div
			className={classNames(styles.layerListItem, {
				[styles.layerListItemSelected]: selected,
			})}
			ref={(ref) => drag(drop(ref))}
			style={{ opacity }}
			onClick={(e) => {
				onClick(value, e);
			}}
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
			<div className={styles.layerListName}>
				<Typography.Text
					style={{ width: "95%" }}
					// copyable
					ellipsis
					editable={{
						maxLength: 100,
						// enterIcon: null,
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

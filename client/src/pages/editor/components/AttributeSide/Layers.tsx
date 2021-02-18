import React, { useState, useCallback, useEffect, useRef } from 'react';
import { observer, inject } from 'mobx-react';
import { Input } from 'antd';
import { runInAction, toJS } from 'mobx';
import { DndProvider, DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import IconFont from 'components/IconFont';
import { LayerInfo, ScreenStore } from 'types';
import styles from './index.module.scss';

interface Props {
  screenStore?: ScreenStore;
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
  moveCard: (dragIndex: DragItem, hoverIndex: DragItem) => void;
  dragEnd: (didDrop: boolean) => void;
  onEditLayerName: (layer: LayerInfo, newName: string) => void;
  selected: boolean;
  index: number;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ACCEPT = 'LayerItem';

const LayerItem = ({
  value,
  onHide,
  onLock,
  onRemove,
  onClick,
  moveCard,
  dragEnd,
  onEditLayerName,
  selected,
  index,
}: LayerItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [editFlag, setEditFlag] = useState(false);
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
      moveCard(item, { id: value.id || '', index, type: ACCEPT });

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

  const [{ isDragging }, drag] = useDrag({
    item: { type: ACCEPT, index, id: value.id },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult, monitor) => {
      // const { id: droppedId, originalIndex } = monitor.getItem()
      const didDrop = monitor.didDrop();
      dragEnd(didDrop);
    },
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div
      className={styles.layer + (selected ? ` ${styles.layerSelected}` : '')}
      ref={ref}
      style={{ opacity }}
    >
      <IconFont
        type="icon-suoding"
        className={styles.icons}
        style={{
          color: value.isLock ? '#fff' : '#444',
          fontSize: '16px',
        }}
        onClick={() => {
          onLock(value);
        }}
      />
      <IconFont
        type="icon-xianshi1"
        className={styles.icons}
        style={{
          right: '0',
          color: value.isHide ? '#444' : '#fff',
          fontSize: '16px',
          marginLeft: 6,
        }}
        onClick={() => {
          onHide(value);
        }}
      />
      {editFlag ? (
        <Input
          defaultValue={value.name}
          autoFocus
          style={{ marginLeft: '12px', flexGrow: 1 }}
          onBlur={(e) => {
            onEditLayerName(value, e.target.value);
            setEditFlag(false);
          }}
        />
      ) : (
        <div
          onDoubleClick={() => {
            setEditFlag(true);
          }}
          style={{
            marginLeft: '12px',
            width: '100%',
            height: '33px',
            lineHeight: '33px',
            overflow: 'hidden',
            flexGrow: 1,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            onClick(value, e);
          }}
          title={value.name}
        >
          {value.name}
        </div>
      )}
      <IconFont
        type="icon-shanchu1"
        className={styles.icons}
        style={{
          right: '0',
          fontSize: '14px',
        }}
        onClick={() => {
          onRemove(value);
        }}
      />
    </div>
  );
};

export default inject('screenStore')(
  observer(({ screenStore }: Props) => {
    const [screenLayers, setScreenLayers] = useState<LayerInfo[]>([]);

    useEffect(() => {
      if (screenStore!.layers) {
        setScreenLayers(toJS(screenStore!.layers));
      }
    }, [screenStore!.layers]);

    const onHide = useCallback(
      (layer: LayerInfo) => {
        // eslint-disable-next-line no-param-reassign
        layer.isHide = !layer.isHide;
        setScreenLayers([...screenLayers]);
        screenStore!.updateLayer(layer.id || '', { isHide: layer.isHide });
      },
      [screenLayers]
    );

    const onLock = useCallback(
      (layer: LayerInfo) => {
        // eslint-disable-next-line no-param-reassign
        layer.isLock = !layer.isLock;
        setScreenLayers([...screenLayers]);
        screenStore!.updateLayer(layer.id || '', { isLock: layer.isLock });
      },
      [screenLayers]
    );

    const onLayerClick = useCallback(
      (
        layerData: LayerInfo,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
      ) => {
        event.stopPropagation();
        const { selectedLayerIds } = screenStore || {};

        if (selectedLayerIds && selectedLayerIds.has(layerData.id || '')) {
          return;
        }

        const ids = toJS(selectedLayerIds);
        if (!event || !event.ctrlKey) {
          ids && ids.clear();
        }

        let currGroupLayers = [layerData];
        if (screenStore && screenStore.layers && layerData.group) {
          // 找出所有同组图层
          currGroupLayers = screenStore.layers.filter(
            (v) => v.group === layerData.group
          );
        }

        // 当前点击的图层及与之群组的图层
        currGroupLayers.forEach((v) => {
          ids && v.id && ids.add(v.id);
        });

        runInAction(() => {
          // eslint-disable-next-line no-param-reassign
          screenStore && ids && (screenStore.selectedLayerIds = ids);
        });
      },
      [screenLayers]
    );

    const onRemove = useCallback(
      (layer: LayerInfo) => {
        screenStore!.confirmDeleteLayer(layer);
      },
      [screenLayers]
    );

    /**
     * 正在拖动
     */
    const moveCard = useCallback(
      (dragItem: DragItem, dropItem: DragItem) => {
        const { index: dragIndex } = dragItem;
        const { index: hoverIndex } = dropItem;

        const layer = screenLayers[dragIndex];
        screenLayers.splice(dragIndex, 1);
        screenLayers.splice(hoverIndex, 0, layer);
        setScreenLayers([...screenLayers]);
      },
      [screenLayers]
    );

    /**
     * 拖动结束
     */
    const onDragEnd = useCallback(
      (didDrop: boolean) => {
        let maxZ = screenLayers.length + 1;
        screenLayers.forEach((v) => {
          // eslint-disable-next-line no-param-reassign
          v.style.z = maxZ;
          maxZ--;
        });
        // 更新信息
        screenStore!.batchUpdateLayer(
          screenLayers.map((v) => ({ id: v.id, style: v.style })),
          true
        );
      },
      [screenLayers]
    );

    const onEditLayerName = useCallback((value: LayerInfo, newName: string) => {
      if (!newName) return;
      screenStore!.updateLayer(value.id || '', { name: newName });
    }, []);

    return (
      <section className={styles.styleSetting}>
        <DndProvider backend={HTML5Backend}>
          {screenLayers.map((layer, index) => {
            return (
              <LayerItem
                key={layer.id}
                value={layer}
                onHide={onHide}
                onLock={onLock}
                moveCard={moveCard}
                onClick={onLayerClick}
                onRemove={onRemove}
                dragEnd={onDragEnd}
                onEditLayerName={onEditLayerName}
                index={index}
                selected={screenStore!.selectedLayerIds.has(layer.id || '')}
              />
            );
          })}
        </DndProvider>
      </section>
    );
  })
);

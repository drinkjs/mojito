import React, { useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Modal } from 'antd';
import { FormOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'components/Image';
import { ComponentInfo } from 'types';
import styles from './index.module.scss';

const { confirm } = Modal;
interface Props {
  value: ComponentInfo;
  onRemove: (value: ComponentInfo) => void;
  onEdit: (value: ComponentInfo) => void;
}

export default ({ value, onRemove, onEdit }: Props) => {
  const [, drag, preview] = useDrag({
    item: { value, type: 'ADD_COMPONENT' },
    // end: (item, monitor: DragSourceMonitor) => {
    //   const dropResult = monitor.getDropResult()
    //   if (item && dropResult) {
    //     alert(`You dropped ${item.name} into ${dropResult.name}!`)
    //   }
    // },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent<any>) => {
    e.stopPropagation();
    onEdit(value);
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent<any>) => {
      e.stopPropagation();
      confirm({
        title: `确定删除${value.title}?`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          onRemove(value);
        }
      });
    },
    [value]
  );

  return (
    <div className={styles.itemView} ref={drag}>
      <div className={styles.itemImgBox}>
        <Image src={value.coverImg} height="76px" />
      </div>
      <div style={{ textAlign: 'center', padding: '3px 0' }}>{value.title}</div>
      {value.origin === 2 && (
        <div className={styles.toolBar}>
          <a onClick={handleEdit}>
            <FormOutlined />
          </a>
          <a onClick={handleRemove}>
            <DeleteOutlined />
          </a>
        </div>
      )}
    </div>
  );
};

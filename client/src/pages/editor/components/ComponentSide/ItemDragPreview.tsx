import * as React from 'react';
import Image from 'components/Image';
import { ComponentInfo } from 'types';
import styles from './index.module.scss';

interface Props {
  value: ComponentInfo;
}

const ItemDragPreview = ({ value }: Props) => {
  return (
    <div
      className={styles.itemView}
      style={{ width: '240px', height: '124px', padding: '14px' }}
    >
      <div className={styles.itemImgBox}>
        <Image src={value.coverImg} height="76px" />
      </div>
      <div style={{ textAlign: 'center', padding: '3px 0' }}>{value.title}</div>
    </div>
  );
};

export default ItemDragPreview;

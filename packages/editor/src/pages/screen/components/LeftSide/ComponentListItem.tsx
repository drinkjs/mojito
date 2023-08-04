import { memo } from 'react';
import { useDrag } from 'react-dnd';
import { Typography } from 'antd';
import Image from '@/components/Image';
import styles from './index.module.css';

const { Text } = Typography;

interface Props {
  value: ComponentInfo;
  scriptUrl:string,
  external?:Record<string, string>,
  packId:string
  packName:string,
  packVersion:string
}

const ComponentListItem = memo(({ value, scriptUrl, external, packId, packName, packVersion }: Props)=>{
  const [{ opacity }, dragRef, preview] = useDrag(
    () => ({
      type: 'ADD_COMPONENT',
      item: { exportName: value.exportName, name:value.name, scriptUrl, external, packId, packName, packVersion  },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1
      })
    }),
    [value, scriptUrl, external]
  )

  // useEffect(() => {
  //   preview(getEmptyImage(), { captureDraggingState: true });
  // }, [preview]);

  return (
    <div ref={dragRef}>
      <div className={styles.compoentCover}>
        <Image src={value.cover} />
      </div>
      <div className={styles.compoentItemText}>
        <Text ellipsis style={{fontSize:"12px"}}>
          {value.name}
        </Text>
      </div>
    </div>
  );
}, (prev, next)=>prev.value !== next.value)

export default ComponentListItem

import { memo, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Typography } from 'antd';
import Image from '@/components/Image';
// import styles from '../../styles/left.module.css';

const { Text } = Typography;

interface Props {
  value: {export:string, name:string, cover?:string};
  scriptUrl:string,
  external?:Record<string, string>
}

const ComponentListItem = memo(({ value, scriptUrl, external }: Props)=>{
  const [{ opacity }, dragRef, preview] = useDrag(
    () => ({
      type: 'ADD_COMPONENT',
      item: { export: value.export, name:value.name, scriptUrl, external  },
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
      <div>
        <Image src={value.cover} />
      </div>
      <div style={{ textAlign: 'center', padding: '3px 0', width: '100%' }}>
        <Text ellipsis>
          {value.name}
        </Text>
      </div>
    </div>
  );
}, (prev, next)=>prev.value !== next.value)

export default ComponentListItem

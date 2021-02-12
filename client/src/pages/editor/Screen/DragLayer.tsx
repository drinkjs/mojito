import React from 'react'
import { XYCoord, useDragLayer } from 'react-dnd'
import BoxDragPreview from '../components/ComponentSide/ItemDragPreview'

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
}

const itemCenter = {
  x: 240 / 2,
  y: 124 / 2
}

function getItemStyles (
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    }
  }
  const { x, y } = currentOffset
  const transform = `translate(${x - itemCenter.x}px, ${y - itemCenter.y}px)`
  return {
    transform,
    WebkitTransform: transform,
    transformOrigin: '0 0 0'
  }
}

const DragLayer = () => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging()
  }))

  function renderItem () {
    switch (itemType) {
      case 'ADD_COMPONENT':
        return <BoxDragPreview value={item.value} />
      default:
        return null
    }
  }

  if (!isDragging) {
    return null
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  )
}

export default DragLayer

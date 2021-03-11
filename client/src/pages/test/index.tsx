import React, { useLayoutEffect, useRef, useState } from 'react';
import Moveable from 'react-moveable';

const Test = () => {
  const rootRef = useRef<HTMLDivElement>();
  const moveableRef = useRef<Moveable>();
  const [element, setElement] = useState<HTMLElement | null>();
  const [frame, setFrame] = useState({ x: 100, y: 100 });

  useLayoutEffect(() => {
    setElement(document.getElementById('ele'));
  });

  const onZoom = (zoom: number) => {
    rootRef.current!.style.transform = `scale(${zoom})`;
    moveableRef.current?.updateRect();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        color: '#000'
      }}
    >
      <div>
        <button
          onClick={() => {
            onZoom(0.5);
          }}
        >
          0.5
        </button>
        <button
          onClick={() => {
            onZoom(1);
          }}
          style={{ marginLeft: '12px' }}
        >
          1.0
        </button>
        <span style={{ marginLeft: '12px' }}>
          x:{' '}
          <input
            value={frame.x}
            onChange={(e) => {
              moveableRef.current?.request(
                'draggable',
                {
                  x: parseInt(e.target.value),
                  y: frame.y
                },
                true
              );
            }}
          />
        </span>
        <span style={{ marginLeft: '12px' }}>
          y:{' '}
          <input
            value={frame.y}
            onChange={(e) => {
              moveableRef.current?.request(
                'draggable',
                {
                  x: frame.x,
                  y: parseInt(e.target.value)
                },
                true
              );
            }}
          />
        </span>
      </div>

      <div
        ref={(ref) => {
          rootRef.current = ref!;
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#000'
        }}
      >
        <div
          id="ele"
          style={{
            width: '300px',
            height: '200px',
            background: '#FFFF00',
            lineHeight: '200px',
            color: '#000',
            transform: `translate(${frame.x}px, ${frame.y}px)`
          }}
        >
          Moveable
        </div>

        <Moveable
          target={element}
          snappable
          throttleDrag={0}
          draggable
          rootContainer={document.body}
          ref={(ref) => {
            moveableRef.current = ref!;
          }}
          onDragStart={(e) => {
            const { set } = e;
            set([frame.x, frame.y]);
          }}
          onDrag={(e) => {
            const { target, beforeTranslate } = e;
            frame.x = Math.round(beforeTranslate[0]);
            frame.y = Math.round(beforeTranslate[1]);
            target.style.transform = `translate(${frame.x}px, ${frame.y}px)`;
          }}
          onDragEnd={() => {
            setFrame({ ...frame });
          }}
        />
      </div>
    </div>
  );
};

export default Test;

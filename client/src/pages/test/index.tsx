import React, { useEffect, useRef, useState } from "react";

let x = 50;
let y = 50;
let lastX = 0;
let lastY = 0;

const Test = () => {
  const rootRef = useRef<HTMLDivElement | null>();
  const currPos = useRef<any>({});
  const [isReady, setIsReady] = useState(false);
  const [rect, setRect] = useState<any>();

  useEffect(() => {
    const rect1 = rootRef.current?.getBoundingClientRect();
    setRect(rect1)
  }, [])

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ccc",
        color: "#000",
        position: "revert"
      }}
      onMouseMove={(e) => {
        if (rootRef.current && isReady) {
          const offsetX = e.clientX - currPos.current.x
          const offSetY = e.clientY - currPos.current.y;
          lastX = x + offsetX;
          lastY = y + offSetY;
          rootRef.current.style.transform = `translateX(${x + offsetX}px) translateY(${y + offSetY}px)`;
        }
      }}
      onMouseUp={() => {
        setIsReady(false);
        x = lastX;
        y = lastY;
      }}
    >
      <div
        id="box"
        ref={(r) => (rootRef.current = r)}
        onMouseDown={(e) => {
          setIsReady(true);
          if (rect) {
            currPos.current.x = e.clientX;
            currPos.current.y = e.clientY;
          }
        }}
        style={{
          width: "100px",
          height: "100px",
          background: "#ff0000",
          transform: `translateX(${x}px) translateY(${y}px)`
        }}
      ></div>
    </div>
  );
};

export default Test;

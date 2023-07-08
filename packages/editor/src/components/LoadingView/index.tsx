import { Skeleton, Spin } from "antd";
import { CSSProperties } from "react";

export default function LoadingView(props:{style?:CSSProperties, type:"skeleton"|"spin"}){
  const { type, style } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        ...style
      }}
    >
      {type === "skeleton" ? <Skeleton active /> : <Spin />}
    </div>
  );
}

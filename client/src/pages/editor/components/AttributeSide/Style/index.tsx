/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from "react";
import {
  Radio,
  Space
} from "antd";
import { observer, inject } from "mobx-react";
import { RelativePosition, ScreenStore } from "types";
import Eventer from "common/eventer";
import styles from "../index.module.scss";
import { LAYER_STYLE_CHANGE } from "config/events";
import { toJS } from "mobx";
import ColorSetting from "./ColorSetting"
import FontSetting from "./FontSetting"
import SizeSetting from "./SizeSetting"
import StyleSlider from "./StyleSlider"
import RelativeSetting from "./RelativeSetting"
import BorderSetting from "./BorderSetting"

export { ColorSetting, SizeSetting, StyleSlider }

interface Props {
  screenStore?: ScreenStore;
}

const sizeItems = [
  {
    label: "X",
    key: "x"
  },
  {
    label: "Y",
    key: "y"
  },
  {
    label: "宽",
    key: "width"
  },
  {
    label: "高",
    key: "height"
  }
];

export default inject("screenStore")(
  observer((props: Props) => {
    const { screenStore } = props;
    const layerStyle = screenStore!.layerStyle;
    const [defaultStyle, setDefaultStyle] = useState(layerStyle);

    useEffect(() => {
      setDefaultStyle(layerStyle ? toJS(layerStyle) : undefined);
    }, [layerStyle]);

    const onStyleChange = (type: string, value: any) => {
      setDefaultStyle(
        defaultStyle ? { ...defaultStyle, [type]: value } : undefined
      );
      screenStore?.currLayer && Eventer.emit(LAYER_STYLE_CHANGE, type, value);
    };

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>位置和尺寸</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {sizeItems.map((v) => {
              const defaultStyleValue: any = defaultStyle;
              return (
                <SizeSetting
                  key={v.key}
                  label={v.label}
                  onChange={(value:any) => {
                    onStyleChange(v.key, value);
                  }}
                  value={defaultStyleValue && defaultStyleValue[v.key]}
                />
              );
            })}
          </div>
        </div>
        <div className={styles.title}>
          <p>相对位置</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Space direction="vertical">
              <span>X</span>
              <RelativeSetting positionTypes={["left", "right"]} value={screenStore?.currLayer?.relativePosition?.x} onChange={(value?:RelativePosition) => {
                if (value) {
                  // 计算x位置信息
                  const findLayer = screenStore?.layers.find(v => v.id === value.layerId);
                  if (findLayer) {
                    onStyleChange("x", findLayer.style.x + (value.positionType === "right" ? findLayer.style.width : 0) + value.offset)
                  }
                }
                screenStore?.currLayer && screenStore?.updateLayer(screenStore.currLayer.id, { relativePosition: { ...screenStore.currLayer?.relativePosition, x: value } })
              }} />
              <span>Y</span>
               <RelativeSetting positionTypes={["top", "bottom"]} value={screenStore?.currLayer?.relativePosition?.y} onChange={(value?:RelativePosition) => {
                 if (value) {
                   // 计算y位置信息
                   const findLayer = screenStore?.layers.find(v => v.id === value.layerId);
                   if (findLayer) {
                     onStyleChange("y", findLayer.style.y + (value.positionType === "bottom" ? findLayer.style.height : 0) + value.offset)
                   }
                 }
                 screenStore?.currLayer && screenStore?.updateLayer(screenStore.currLayer.id, { relativePosition: { ...screenStore.currLayer?.relativePosition, y: value } })
               }} />
            </Space>
          </div>
        </div>
        <div className={styles.title}>
          <p>溢出</p>
          <Radio.Group
            value={
              defaultStyle && defaultStyle.overflow
                ? defaultStyle.overflow
                : "visible"
            }
            onChange={(e) => {
              onStyleChange("overflow", e.target.value);
            }}
          >
            <Radio.Button value="visible">显示</Radio.Button>
            <Radio.Button value="hidden">隐藏</Radio.Button>
            <Radio.Button value="auto">滚动</Radio.Button>
          </Radio.Group>
        </div>
        <div className={styles.title}>
          <p>颜色</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ColorSetting
              label="背景颜色"
              value={
                defaultStyle && defaultStyle.backgroundColor
                  ? defaultStyle.backgroundColor.toString()
                  : undefined
              }
              onChange={(color: string | undefined) => {
                onStyleChange("backgroundColor", color);
              }}
            />
            <ColorSetting
              label="字体颜色"
              defaultColor="#000"
              value={defaultStyle ? defaultStyle.color : undefined}
              onChange={(color: string | undefined) => {
                onStyleChange("color", color);
              }}
            />
          </div>
        </div>
        <div className={styles.title}>
          <p>文字</p>
          <div style={{ marginTop: "12px" }}>
            <FontSetting onChange={onStyleChange} value={defaultStyle} />
          </div>
        </div>
        <div className={styles.title}>
          <p>边框</p>
          <div style={{ marginTop: "12px" }}>
            <BorderSetting onChange={onStyleChange} value={defaultStyle} />
          </div>
        </div>
        <div className={styles.title}>
          <StyleSlider
            min={1}
            max={100}
            label="不透明度"
            formatter="%"
            value={
              defaultStyle && defaultStyle.opacity !== undefined
                ? parseFloat(defaultStyle.opacity.toString()) * 100
                : 100
            }
            onChange={(value:number) => {
              onStyleChange("opacity", (value / 100).toFixed(2));
            }}
          />
        </div>
        <div className={styles.title}>
          <StyleSlider
            min={0}
            max={200}
            label="缩放比例"
            formatter="%"
            value={
              defaultStyle && defaultStyle.scale !== undefined
                ? defaultStyle.scale * 100
                : 100
            }
            onChange={(value:number) => {
              onStyleChange("scale", `${(value / 100).toFixed(2)}`);
            }}
          />
        </div>
        <div className={styles.title}>
          <StyleSlider
            min={0}
            max={360}
            label="旋转角度"
            value={
              defaultStyle && defaultStyle.rotate !== undefined
                ? parseInt(defaultStyle.rotate.replace("deg", ""))
                : 0
            }
            onChange={(value:number) => {
              onStyleChange("rotate", `${value}deg`);
            }}
          />
        </div>
      </section>
    );
  })
);

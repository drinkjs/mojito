import React, { useState, useEffect } from "react";
import { InputNumber, Select, Space } from "antd";
import { observer, inject } from "mobx-react";
import { RelativePosition, ScreenStore } from "types";

// export interface RelativeValue {
//   layerId: string;
//   offset: number;
//   positionType: "left" | "right" | "top" | "bottom";
// }

interface RelativeSettingProps {
  label?: string;
  value?: RelativePosition;
  screenStore?: ScreenStore;
  onChange: (value?: RelativePosition) => void;
  positionTypes: ("left" | "right" | "top" | "bottom")[]; // left right top bottom
}

const positionTypeText = {
  left: "左侧",
  right: "右侧",
  top: "顶部",
  bottom: "底部"
};

const { Option } = Select;

const RelativeSetting = inject("screenStore")(
  observer((props: RelativeSettingProps) => {
    const { screenStore, label, positionTypes, value, onChange } = props;
    const [changeValue, setChangeValue] = useState<
      | {
          layerId?: string;
          offset?: number;
          positionType?: "left" | "right" | "top" | "bottom";
        }
      | undefined
    >(value);

    useEffect(() => {
      if (value) {
        const { layerId, offset, positionType } = value;
        const layer = screenStore?.layers.find((v) => v.id === layerId);
        if (layer) {
          const layerX = layer.style.x + (positionType === "right" ? layer.style.width : 0);
          const layerY = layer.style.y + (positionType === "bottom" ? layer.style.height : 0);
          const currX = screenStore?.currLayer?.style.x;
          const currY = screenStore?.currLayer?.style.y;
          if ((positionType === "left" || positionType === "right") && currX && (currX - layerX !== offset)) {
            setChangeValue({ ...value, offset: currX - layerX })
          } else if ((positionType === "top" || positionType === "bottom") && currY && (currY - layerY !== offset)) {
            setChangeValue({ ...value, offset: currY - layerY })
          }
        }
      }
    }, [value, screenStore?.currLayer?.style.x, screenStore?.currLayer?.style.y]);

    useEffect(() => {
      if (
        changeValue?.layerId &&
        changeValue?.offset !== undefined &&
        changeValue?.positionType
      ) {
        const { layerId, offset, positionType } = changeValue;
        if (value?.layerId !== layerId || value?.offset !== offset || value.positionType !== positionType) {
          onChange({ layerId, offset, positionType });
        }
      } else if (
        !changeValue?.layerId &&
        changeValue?.offset === undefined &&
        !changeValue?.positionType
      ) {
        onChange(undefined);
      }
    }, [changeValue]);

    const findLayer = (layerId: string) => {
      const layer = screenStore?.layers.find((v) => v.id === layerId);
      return layer ? layer.id : undefined;
    };

    return (
      <Space>
        {label}
        <Select
          style={{ width: "100px" }}
          placeholder="相对图层"
          allowClear
          value={
            changeValue && changeValue.layerId
              ? findLayer(changeValue.layerId)
              : undefined
          }
          onChange={(layerId: string) => {
            setChangeValue({ ...changeValue, layerId });
          }}
        >
          {screenStore?.layers.map((v) => (
            <Option key={v.id} value={v.id}>
              {v.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="位置"
          allowClear
          value={changeValue ? changeValue.positionType : undefined}
          onChange={(positionType: "left" | "right" | "top" | "bottom") => {
            setChangeValue({ ...changeValue, positionType });
          }}
        >
          {positionTypes.map((v) => (
            <Option key={v} value={v}>
              {positionTypeText[v]}
            </Option>
          ))}
        </Select>
        <InputNumber
          placeholder="偏移"
          value={changeValue ? changeValue.offset : undefined}
          onChange={(offset: number) => {
            setChangeValue({ ...changeValue, offset });
          }}
        />
      </Space>
    );
  })
);

export default RelativeSetting;

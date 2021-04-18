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
  screenStore?: ScreenStore;
  value?: RelativePosition;
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
    const { screenStore, label, value, positionTypes, onChange } = props;
    const [changeValue, setChangeValue] = useState<
      | {
          layerId?: string;
          offset?: number;
          positionType?: "left" | "right" | "top" | "bottom";
        }
      | undefined
    >(value);

    useEffect(() => {
      if (changeValue?.layerId && changeValue?.offset !== undefined && changeValue?.positionType) {
        const { layerId, offset, positionType } = changeValue;
        onChange({ layerId, offset, positionType })
      } else {
        onChange(undefined)
      }
    }, [changeValue])

    const findLayer = (layerId:string) => {
      const layer = screenStore?.layers.find(v => v.id === layerId);
      return layer ? layer.id : undefined
    }

    return (
      <Space>
         {label}
        <Select
          style={{ width: "100px" }}
          placeholder="相对图层"
          allowClear
          value={value ? findLayer(value.layerId) : undefined}
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
        <Select placeholder="位置" allowClear value={value ? value.positionType : undefined}
          onChange={(positionType:"left" | "right" | "top" | "bottom") => {
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
          value={value ? value.offset : undefined}
          onChange={(offset: number) => {
            setChangeValue({ ...changeValue, offset });
          }}
        />
      </Space>
    );
  })
);

export default RelativeSetting;

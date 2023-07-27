import {
  InputNumber,
  InputNumberProps,
  Space
} from "antd";
import React from "react";
import ItemLabel from "./ItemLabel";

export const SizeSetting = (props: {
  label: string;
  value: number;
  onChange: (value: number | string | undefined | null) => void;
  inputNumberProps?: InputNumberProps;
  labelStyle?:React.CSSProperties
}) => {
  const { label, onChange, value, inputNumberProps, labelStyle } = props;
  return (
    <Space>
      <ItemLabel style={labelStyle}>{label}</ItemLabel>
      <span>
        <InputNumber
          {...inputNumberProps}
          style={{ width: "80px", marginLeft: "6px" }}
          onChange={onChange}
          value={value}
        />
      </span>
    </Space>
  );
};

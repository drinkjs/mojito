import React from "react";
import {
  InputNumber,
  Slider,
  Row,
  Col
} from "antd";

const StyleSlider = (props: {
  value?: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  formatter?: string;
}) => {
  const { value, onChange, label, min, max, formatter = "" } = props;
  return (
    <div>
      {label}
      <Row>
        <Col span={15}>
          <Slider
            min={min}
            max={max}
            step={1}
            value={value && Math.round(value)}
            onChange={onChange}
          />
        </Col>
        <Col span={7} style={{ marginLeft: "12px" }}>
          <InputNumber
            min={min}
            max={max}
            formatter={(val) =>
              val === undefined ? "" : `${parseInt(`${val}`)}${formatter}`
            }
            parser={(val) => (val ? parseInt(val.replace(formatter, "")) : 0)}
            style={{ width: "100%" }}
            value={value && Math.round(value)}
            onChange={onChange}
            step={1}
          />
        </Col>
      </Row>
    </div>
  );
};

export default StyleSlider;

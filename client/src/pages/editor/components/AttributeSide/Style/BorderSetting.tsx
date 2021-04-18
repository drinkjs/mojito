import React from "react";
import { InputNumber, Select } from "antd";
import ColorSetting from "./ColorSetting"
import styles from "./index.module.scss";

const { Option } = Select;

const BorderSetting = (props: {
  value: any;
  onChange: (type: string, value: any) => void;
}) => {
  const { onChange, value } = props;
  const subTitle = {
    display: "inline-block",
    width: "50%",
    padding: "0 3px",
    fontSize: "12px"
  };
  return (
    <article
      className={styles.itemBox}
      style={{ width: "100%", flexWrap: "wrap" }}
    >
      <section style={{ width: "100%" }}>
        <div style={subTitle}>
          <div>风格</div>
          <Select
            style={{ width: "100%", marginTop: "6px" }}
            defaultValue="auto"
            value={value && value.borderStyle ? value.borderStyle : "none"}
            onChange={(val) => {
              onChange("borderStyle", val);
            }}
          >
            <Option value="none">none</Option>
            <Option value="solid">solid</Option>
            <Option value="dotted">dotted</Option>
            <Option value="dashed">dashed</Option>
            <Option value="double">double</Option>
            <Option value="groove">groove</Option>
            <Option value="ridge">ridge</Option>
            <Option value="inset">inset</Option>
            <Option value="outset">outset</Option>
            <Option value="hidden">hidden</Option>
          </Select>
        </div>
        <div style={subTitle}>
          <div>大小</div>
          <InputNumber
            value={value ? value.borderWidth : undefined}
            style={{ width: "100%", marginTop: "6px" }}
            onChange={(val) => {
              onChange("borderWidth", val);
            }}
          />
        </div>
        <br />
        <div style={{ ...subTitle, marginTop: "6px" }}>
          <div>颜色</div>
          <ColorSetting
            value={value ? value.borderColor : undefined}
            onChange={(val) => {
              onChange("borderColor", val);
            }}
          />
        </div>

        <div style={{ ...subTitle, marginTop: "6px" }}>
          <div>圆角</div>
          <InputNumber
            value={value ? value.borderRadius : undefined}
            style={{ width: "100%", marginTop: "6px" }}
            onChange={(val) => {
              onChange("borderRadius", val);
            }}
          />
        </div>
      </section>
    </article>
  );
};

export default BorderSetting;

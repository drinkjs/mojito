import React from "react";
import {
  InputNumber,
  Select
} from "antd";
import styles from "./index.module.scss";

const { Option } = Select;

const FontSetting = (props: {
  value: any;
  onChange: (type: string, value: any) => void;
  showItems?: ("fontFamily"|"fontSize"|"fontWeight"|"textAlign")[]; // "fontFamily", "fontSize", "fontWeight", "textAlign"
}) => {
  const { onChange, value } = props;
  const subTitle = {
    display: "inline-block",
    width: "50%",
    padding: "0 3px",
    fontSize: "12px"
  };
  let { showItems } = props;
  if (!showItems) {
    showItems = ["fontFamily", "fontSize", "fontWeight", "textAlign"];
  }
  return (
    <article
      className={styles.itemBox}
      style={{ width: "100%", flexWrap: "wrap" }}
    >
      {/* <label style={{ width: "25px" }}>字体</label> */}
      <section style={{ width: "100%" }}>
        {showItems.indexOf("fontFamily") >= 0 && (
          <div style={subTitle}>
            <div>字体</div>
            <Select
              style={{ width: "100%", marginTop: "6px" }}
              defaultValue="auto"
              value={value && value.fontFamily ? value.fontFamily : "auto"}
              onChange={(val) => {
                onChange("fontFamily", val);
              }}
            >
              <Option value="auto">auto</Option>
              <Option value="微软雅黑">微软雅黑</Option>
              <Option value="宋体">宋体</Option>
              <Option value="黑体">黑体</Option>
            </Select>
          </div>
        )}
        {showItems.indexOf("fontSize") >= 0 && (
          <div style={subTitle}>
            <div>大小</div>
            <InputNumber
              value={value && value.fontSize ? value.fontSize : 14}
              style={{ width: "100%", marginTop: "6px" }}
              onChange={(val) => {
                onChange("fontSize", val);
              }}
            />
          </div>
        )}
        <br />
        {showItems.indexOf("fontWeight") >= 0 && (
          <div style={{ ...subTitle, marginTop: "6px" }}>
            <div>加粗</div>
            <Select
              style={{ width: "100%", marginTop: "6px" }}
              value={value && value.fontWeight ? value.fontWeigh : "normal"}
              onChange={(val) => {
                onChange("fontWeight", val);
              }}
            >
              <Option value="normal">normal</Option>
              <Option value="bold">bold</Option>
              <Option value={100}>100</Option>
              <Option value={200}>200</Option>
              <Option value={300}>300</Option>
              <Option value={500}>500</Option>
              <Option value={600}>600</Option>
            </Select>
          </div>
        )}
        {showItems.indexOf("textAlign") >= 0 && (
          <div style={{ ...subTitle, marginTop: "6px" }}>
            <div>对齐</div>
            <Select
              style={{ width: "100%", marginTop: "6px" }}
              value={value && value.textAlign ? value.textAlign : "left"}
              onChange={(val) => {
                onChange("textAlign", val);
              }}
            >
              <Option value="left">left</Option>
              <Option value="center">center</Option>
              <Option value="right">right</Option>
            </Select>
          </div>
        )}
      </section>
    </article>
  );
};

export default FontSetting;

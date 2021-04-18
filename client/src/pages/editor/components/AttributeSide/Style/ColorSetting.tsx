import React, { useCallback, useState, useEffect } from "react";
import { Popover } from "antd";
import { ChromePicker } from "react-color";
import IconFont from "components/IconFont";
import styles from "./index.module.scss";

const ColorSetting = (props: {
  label?: string;
  value: string | undefined;
  defaultColor?: string;
  onChange: (value: string | undefined) => void;
}) => {
  const { label, value, defaultColor, onChange } = props;
  const [changeColor, setChangeColor] = useState<string | undefined>(value);

  useEffect(() => {
    setChangeColor(value || defaultColor);
  }, [value]);

  const onChangeColor = useCallback((colorObj: any) => {
    setChangeColor(colorObj.rgb);
  }, []);

  return (
    <article className={styles.itemBox}>
      {label && <label htmlFor={label}>{label}</label>}
      <div
        style={{
          width: "40px",
          height: "24px",
          padding: "2px",
          border: "1px solid #ccc",
          marginLeft: "6px"
        }}
      >
        <Popover
          content={
            <ChromePicker
              color={changeColor}
              onChange={onChangeColor}
              onChangeComplete={({ rgb }) => {
                onChange(`rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`);
              }}
            />
          }
          title={label}
          trigger="click"
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: value || defaultColor || "#FFF",
              cursor: "pointer"
            }}
          />
        </Popover>
      </div>
      <div
        style={{ marginLeft: "3px", cursor: "pointer" }}
        onClick={() => {
          onChange(defaultColor);
        }}
      >
        <IconFont type="icon-qingkong" />
      </div>
    </article>
  );
};

export default ColorSetting;

import React from "react";
import {
  InputNumber,
  InputNumberProps
} from "antd";
import styles from "./index.module.scss";

const SizeSetting = (props: {
  label: string;
  value: number;
  onChange: (value: number | string | undefined | null) => void;
  inputNumberProps?: InputNumberProps;
}) => {
  const { label, onChange, value, inputNumberProps } = props;
  return (
    <article className={styles.itemBox}>
      <label htmlFor={label}>{label}</label>
      <span>
        <InputNumber
          {...inputNumberProps}
          style={{ width: "80px", marginLeft: "6px" }}
          onChange={onChange}
          value={value}
        />
      </span>
    </article>
  );
};

export default SizeSetting;

import {
  InputNumber,
  InputNumberProps,
  Space
} from "antd";
import ItemLabel from "./ItemLabel";

export const SizeSetting = (props: {
  label: string;
  value: number;
  onChange: (value: number | string | undefined | null) => void;
  inputNumberProps?: InputNumberProps;
}) => {
  const { label, onChange, value, inputNumberProps } = props;
  return (
    <Space>
      <ItemLabel>{label}</ItemLabel>
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

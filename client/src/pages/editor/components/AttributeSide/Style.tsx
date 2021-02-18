/* eslint-disable react/require-default-props */
import React, { useCallback, useState, useEffect } from 'react';
import { InputNumber, Select, Slider, Row, Col, Popover } from 'antd';
import { observer, inject } from 'mobx-react';
import { ChromePicker } from 'react-color';
import { ScreenStore } from 'types';
import { toJS } from 'mobx';
import IconFont from 'components/IconFont';
import styles from './index.module.scss';

const { Option } = Select;

export const SizeItem = (props: {
  label: string;
  value: number;
  onChange: (value: number | string | undefined | null) => void;
}) => {
  const { label, onChange, value } = props;
  return (
    <article className={styles.itemBox}>
      <label htmlFor={label}>{label}</label>
      <span>
        <InputNumber
          style={{ width: '80px', marginLeft: '6px' }}
          onChange={onChange}
          value={value}
        />
      </span>
    </article>
  );
};

export const ColorItem = (props: {
  label: string;
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
      <label htmlFor={label}>{label}</label>
      <div
        style={{
          width: '40px',
          height: '24px',
          padding: '2px',
          border: '1px solid #ccc',
          marginLeft: '6px'
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
              width: '100%',
              height: '100%',
              background: value || defaultColor || '#FFF',
              cursor: 'pointer'
            }}
          />
        </Popover>
      </div>
      <div
        style={{ marginLeft: '3px', cursor: 'pointer' }}
        onClick={() => {
          onChange(defaultColor);
        }}
      >
        <IconFont type="icon-qingkong" />
      </div>
    </article>
  );
};

export const FontItem = (props: {
  value: any;
  onChange: (type: string, value: any) => void;
  showItems?: string[]; // "fontFamily", "fontSize", "fontWeight", "textAlign"
}) => {
  const { onChange, value } = props;
  const subTitle = {
    display: 'inline-block',
    width: '50%',
    padding: '0 3px',
    fontSize: '12px'
  };
  let { showItems } = props;
  if (!showItems) {
    showItems = ['fontFamily', 'fontSize', 'fontWeight', 'textAlign'];
  }
  return (
    <article
      className={styles.itemBox}
      style={{ width: '100%', flexWrap: 'wrap' }}
    >
      {/* <label style={{ width: "25px" }}>字体</label> */}
      <section style={{ width: '100%' }}>
        {showItems.indexOf('fontFamily') >= 0 && (
          <div style={subTitle}>
            <div>字体</div>
            <Select
              style={{ width: '100%', marginTop: '6px' }}
              defaultValue="auto"
              value={value.fontFamily || 'auto'}
              onChange={(val) => {
                onChange('fontFamily', val);
              }}
            >
              <Option value="auto">auto</Option>
              <Option value="微软雅黑">微软雅黑</Option>
              <Option value="宋体">宋体</Option>
              <Option value="黑体">黑体</Option>
            </Select>
          </div>
        )}
        {showItems.indexOf('fontSize') >= 0 && (
          <div style={subTitle}>
            <div>大小</div>
            <InputNumber
              value={value.fontSize || 14}
              style={{ width: '100%', marginTop: '6px' }}
              onChange={(val) => {
                onChange('fontSize', val);
              }}
            />
          </div>
        )}
        <br />
        {showItems.indexOf('fontWeight') >= 0 && (
          <div style={{ ...subTitle, marginTop: '6px' }}>
            <div>加粗</div>
            <Select
              style={{ width: '100%', marginTop: '6px' }}
              value={value.fontWeight || 'normal'}
              onChange={(val) => {
                onChange('fontWeight', val);
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
        {showItems.indexOf('textAlign') >= 0 && (
          <div style={{ ...subTitle, marginTop: '6px' }}>
            <div>对齐</div>
            <Select
              style={{ width: '100%', marginTop: '6px' }}
              value={value.textAlign || 'left'}
              onChange={(val) => {
                onChange('textAlign', val);
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

export const SliderItem = (props: {
  value: any;
  onChange: (value: any) => void;
  label: string;
  min?: number;
  max?: number;
  formatter?: string;
}) => {
  const { value, onChange, label, min, max, formatter = '' } = props;
  return (
    <div>
      {label}
      <Row>
        <Col span={15}>
          <Slider
            min={min}
            max={max}
            step={1}
            value={Math.round(value)}
            onChange={onChange}
          />
        </Col>
        <Col span={7} style={{ marginLeft: '12px' }}>
          <InputNumber
            min={min}
            max={max}
            formatter={(val) => `${val}${formatter}`}
            parser={(val) => (val ? val.replace(formatter, '') : '')}
            style={{ width: '100%' }}
            value={Math.round(value)}
            onChange={onChange}
            step={1}
          />
        </Col>
      </Row>
    </div>
  );
};

interface Props {
  screenStore?: ScreenStore;
}

const sizeItems = [
  {
    label: 'X轴',
    key: 'x'
  },
  {
    label: 'Y轴',
    key: 'y'
  },
  {
    label: '宽',
    key: 'width'
  },
  {
    label: '高',
    key: 'height'
  }
];

let timerId: any;
/**
 * 限流函数
 * @param callback
 */
const limitChange = (callback: Function, timeout: number = 500) => {
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(callback, timeout);
};

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const layerStyle = screenStore!.layerStyle;
    const [defaultStyle, setDefaultStyle] = useState(layerStyle);

    useEffect(() => {
      return () => {
        clearTimeout(timerId);
      };
    }, []);

    useEffect(() => {
      setDefaultStyle(layerStyle ? toJS(layerStyle) : undefined);
    }, [layerStyle]);

    const onStyleChange = (type: string, value: any) => {
      setDefaultStyle(
        defaultStyle ? { ...defaultStyle, [type]: value } : undefined
      );
      limitChange(() => {
        if (screenStore && screenStore.currLayer && screenStore.currLayer.id) {
          screenStore.saveLayerStyle(screenStore.currLayer.id, {
            [type]: value
          });
        }
      });
    };

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>位置和尺寸</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sizeItems.map((v) => {
              const defaultStyleValue: any = defaultStyle;
              return (
                <SizeItem
                  key={v.key}
                  label={v.label}
                  onChange={(value) => {
                    onStyleChange(v.key, value);
                  }}
                  value={defaultStyleValue && defaultStyleValue[v.key]}
                />
              );
            })}
          </div>
        </div>
        <div className={styles.title}>
          <p>颜色</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ColorItem
              label="背景颜色"
              value={
                defaultStyle && defaultStyle.backgroundColor
                  ? defaultStyle.backgroundColor.toString()
                  : undefined
              }
              onChange={(color: string | undefined) => {
                onStyleChange('backgroundColor', color);
              }}
            />
            <ColorItem
              label="字体颜色"
              defaultColor="#000"
              value={defaultStyle ? defaultStyle.color : undefined}
              onChange={(color: string | undefined) => {
                onStyleChange('color', color);
              }}
            />
          </div>
        </div>
        <div className={styles.title}>
          <p>文字</p>
          <div style={{ marginTop: '12px' }}>
            <FontItem onChange={onStyleChange} value={defaultStyle} />
          </div>
        </div>
        <div className={styles.title}>
          <SliderItem
            min={1}
            max={100}
            label="不透明度"
            formatter="%"
            value={
              defaultStyle && defaultStyle.opacity !== undefined
                ? parseFloat(defaultStyle.opacity.toString()) * 100
                : 100
            }
            onChange={(value) => {
              onStyleChange('opacity', (value / 100).toFixed(2));
            }}
          />
        </div>
        <div className={styles.title}>
          <SliderItem
            min={0}
            max={200}
            label="缩放比例"
            formatter="%"
            value={
              defaultStyle && defaultStyle['transform-scale'] !== undefined
                ? defaultStyle['transform-scale'] * 100
                : 100
            }
            onChange={(value) => {
              onStyleChange('transform-scale', `${(value / 100).toFixed(2)}`);
            }}
          />
        </div>
        <div className={styles.title}>
          <SliderItem
            min={0}
            max={360}
            label="旋转角度"
            formatter="deg"
            value={
              defaultStyle && defaultStyle['transform-rotate'] !== undefined
                ? defaultStyle['transform-rotate'].replace('deg', '')
                : 0
            }
            onChange={(value) => {
              onStyleChange('transform-rotate', `${value}deg`);
            }}
          />
        </div>
      </section>
    );
  })
);

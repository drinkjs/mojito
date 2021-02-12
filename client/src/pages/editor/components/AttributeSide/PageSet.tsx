import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { Radio } from 'antd';
import UploadImg from 'components/UploadImg';
import { ScreenStore } from 'types';
import { DefaulBackgroundColor, DefaultFontColor } from 'config';
import styles from './index.module.scss';
import { SizeItem, ColorItem, FontItem } from './Style';

const sizeItems = [
  {
    label: '宽度',
    key: 'width'
  },
  {
    label: '高度',
    key: 'height'
  }
];

let timerId: any;

interface Props {
  screenStore?: ScreenStore;
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const screenStyle: any =
      screenStore!.screenInfo && screenStore!.screenInfo.options
        ? screenStore!.screenInfo.options
        : {};
    /**
     * 限流函数
     * @param callback
     */
    const limitChange = (callback: Function, timeout: number = 500) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      // 限流
      timerId = setTimeout(callback, timeout);
    };

    const onStyleChange = (type: string, value: any) => {
      // setDefaultStyle({ ...defaultStyle, [type]: value });
      limitChange(() => {
        if (screenStore && screenStore.screenInfo) {
          screenStore.saveStyle({
            ...screenStore.screenInfo.options,
            [type]: value
          });
        }
      });
    };

    const onUpload = React.useCallback((path: string | undefined) => {
      if (screenStore && screenStore.screenInfo) {
        screenStore.saveStyle({
          ...screenStore.screenInfo.options,
          backgroundImage: path
        });
      }
    }, []);

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>页面尺寸</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sizeItems.map((v) => {
              return (
                <SizeItem
                  key={v.key}
                  label={v.label}
                  onChange={(value) => {
                    onStyleChange(v.key, value);
                  }}
                  value={screenStyle[v.key]}
                />
              );
            })}
          </div>
        </div>
        <div className={styles.title}>
          <p>页面颜色</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ColorItem
              label="背景颜色"
              defaultColor={DefaulBackgroundColor}
              value={screenStyle.backgroundColor}
              onChange={(color: string | undefined) => {
                onStyleChange('backgroundColor', color);
              }}
            />
            <ColorItem
              label="字体颜色"
              defaultColor={DefaultFontColor}
              value={screenStyle.color}
              onChange={(color: string | undefined) => {
                onStyleChange('color', color);
              }}
            />
          </div>
        </div>
        <div className={styles.title}>
          <p>文字</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <FontItem
              value={screenStyle}
              showItems={['fontFamily', 'fontSize']}
              onChange={onStyleChange}
            />
          </div>
        </div>
        {screenStore!.screenInfo && (
          <div className={styles.title}>
            <p>背景图</p>
            <UploadImg
              data={{ id: screenStore!.screenInfo.id }}
              onChange={onUpload}
              value={
                screenStore!.screenInfo.options
                  ? screenStore!.screenInfo.options.backgroundImage
                  : undefined
              }
            />
            {screenStore!.screenInfo.options &&
              screenStore!.screenInfo.options.backgroundImage && (
                <Radio.Group
                  value={
                    screenStore!.screenInfo.options.backgroundRepeat || 'repeat'
                  }
                  buttonStyle="solid"
                  onChange={(e) => {
                    onStyleChange('backgroundRepeat', e.target.value);
                  }}
                >
                  <Radio.Button value="repeat">平铺</Radio.Button>
                  <Radio.Button value="no-repeat">拉伸</Radio.Button>
                </Radio.Group>
              )}
          </div>
        )}
      </section>
    );
  })
);

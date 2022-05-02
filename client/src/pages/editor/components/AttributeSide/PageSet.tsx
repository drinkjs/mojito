import React, { useEffect, useState } from "react";
import { observer, inject } from "mobx-react";
import { Radio } from "antd";
import { useDebounceFn } from "ahooks";
import UploadImg from "components/UploadImg";
import { ScreenStore } from "types";
import { DefaulBackgroundColor, DefaultFontColor } from "config";
import styles from "./index.module.scss";
import { SizeSetting, ColorSetting } from "./Style";
// import DataSourceSet from "./DataSourceSet"

const sizeItems = [
  {
    label: "宽度",
    key: "width"
  },
  {
    label: "高度",
    key: "height"
  }
];

interface Props {
  screenStore?: ScreenStore;
}

export default inject("screenStore")(
  observer((props: Props) => {
    const { screenStore } = props;
    const [screenStyle, setScreenStyle] = useState<any>(
      screenStore!.screenInfo && screenStore!.screenInfo.style
        ? screenStore!.screenInfo.style
        : {}
    );

    useEffect(() => {
      return () => {
        debounceFn.cancel();
      };
    }, []);

    const debounceFn = useDebounceFn((type: string, value: any) => {
      if (screenStore && screenStore.screenInfo) {
        screenStore.saveStyle({
          ...screenStore.screenInfo.style,
          [type]: value
        });
      }
    });

    const onUpload = React.useCallback((path: string | undefined) => {
      if (screenStore && screenStore.screenInfo) {
        screenStore.saveStyle({
          ...screenStore.screenInfo.style,
          backgroundImage: path
        });
      }
    }, []);

    const onStyleChange = (type: string, value: any) => {
      setScreenStyle({
        ...screenStyle,
        [type]: value
      });
      debounceFn.run(type, value);
    };

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>页面尺寸</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {sizeItems.map((v) => {
              return (
                <SizeSetting
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
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <ColorSetting
              label="背景颜色"
              defaultColor={DefaulBackgroundColor}
              value={screenStyle.backgroundColor}
              onChange={(color: string | undefined) => {
                onStyleChange("backgroundColor", color);
              }}
            />
            <ColorSetting
              label="字体颜色"
              defaultColor={DefaultFontColor}
              value={screenStyle.color}
              onChange={(color: string | undefined) => {
                onStyleChange("color", color);
              }}
            />
          </div>
        </div>
        {/* <div className={styles.title}>
          <p>文字</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <FontItem
              value={screenStyle}
              showItems={['fontFamily', 'fontSize']}
              onChange={onStyleChange}
            />
          </div>
        </div> */}
        {screenStore!.screenInfo && (
          <div className={styles.title}>
            <p>背景图</p>
            <UploadImg
              data={{ id: screenStore!.screenInfo.id }}
              onChange={onUpload}
              value={
                screenStore!.screenInfo.style
                  ? screenStore!.screenInfo.style.backgroundImage
                  : undefined
              }
            />
            {screenStore!.screenInfo.style &&
              screenStore!.screenInfo.style.backgroundImage && (
                <Radio.Group
                  value={
                    screenStore!.screenInfo.style.backgroundRepeat || "repeat"
                  }
                  buttonStyle="solid"
                  onChange={(e) => {
                    onStyleChange("backgroundRepeat", e.target.value);
                  }}
                >
                  <Radio.Button value="repeat">平铺</Radio.Button>
                  <Radio.Button value="no-repeat">拉伸</Radio.Button>
                </Radio.Group>
              )}
          </div>
        )}
        {/* <DataSourceSet /> */}
      </section>
    );
  })
);

/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { ScreenStore } from 'types';
import { toJS } from 'mobx';
import Eventer from 'common/eventer';
import styles from './index.module.scss';
import { SizeItem } from './Style';
import { GROUP_STYLE_CHANGE } from 'config/events';
import { useDebounceFn } from 'ahooks';

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

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const [defaultStyle, setDefaultStyle] = useState<any>(
      screenStore?.moveableRect
    );

    useEffect(() => {
      return () => {
        debounceChange.cancel();
      };
    }, []);

    useEffect(() => {
      setDefaultStyle(toJS(screenStore?.moveableRect));
    }, [screenStore?.moveableRect]);

    const onStyleChange = (type: string, value: any) => {
      if (isNaN(value)) return;
      const newStyle: any = { ...defaultStyle, [type]: value };
      setDefaultStyle(newStyle);
      debounceChange.run(newStyle);
    };

    const debounceChange = useDebounceFn(
      (style: any) => {
        Eventer.emit(GROUP_STYLE_CHANGE, style);
      },
      {
        wait: 500
      }
    );

    return (
      <section className={styles.styleSetting}>
        <div className={styles.title}>
          <p>群组位置和尺寸</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sizeItems.map((v) => {
              return (
                <SizeItem
                  key={v.key}
                  label={v.label}
                  onChange={(value) => {
                    onStyleChange(v.key, value);
                  }}
                  value={defaultStyle && defaultStyle[v.key]}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  })
);

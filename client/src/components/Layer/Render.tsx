/* eslint-disable react/no-this-in-sfc */
import { message } from 'antd';
import React, { useRef, useEffect, useState } from 'react';
import { ComponentStyle } from 'types';

interface RenderProps {
  props: any;
  styles: ComponentStyle;
  events: any;
  component: any;
  initFlag: boolean;
  isVue: boolean;
  onInitSize: (width: number, height: number) => void;
  children?: any;
  style?: React.CSSProperties;
}

export default ({
  onInitSize,
  initFlag,
  props,
  styles,
  events,
  component,
  isVue,
  style,
}: RenderProps) => {
  const ref = useRef<HTMLDivElement | null>();
  const vueRef = useRef<HTMLDivElement | null>();
  const vueObj = useRef<any>(); // vue 组件对象
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    if (isVue) setIsInit(true);
  }, []);

  useEffect(() => {
    if (!isVue && onInitSize && !initFlag) {
      onInitSize(ref!.current!.offsetWidth, ref!.current!.offsetHeight);
    }
  }, [initFlag]);

  /**
   * 生成react 组件
   * @param funComp
   */
  const createReact = () => {
    return React.createElement(component, {
      ...props,
      styles,
      ...events,
    });
  };

  /**
   * 生成vue组件
   */
  const createVue = () => {
    if (!isInit) return;
    const globalAny: any = global;
    const { Vue } = globalAny;
    if (!Vue) {
      message.error({ content: 'Vue没定义', key: 'noVue' });
      return;
    }

    if (vueObj.current) {
      // 更新props
      Object.keys(props).forEach((key) => {
        Vue.set(vueObj.current, key, props[key]);
      });
      Vue.set(vueObj.current, 'styles', styles);
      return;
    }

    vueObj.current = new Vue({
      el: vueRef.current,
      data: {
        ...props,
        styles,
      },
      mounted() {
        this.$nextTick(() => {
          onInitSize(this.$el.offsetWidth, this.$el.offsetHeight);
        });
      },
      render(createElement: any) {
        return createElement(component, {
          props: {
            ...this,
          },
          on: {
            ...events,
          },
        });
      },
    });
  };

  return (
    <div
      ref={(r) => {
        ref.current = r;
      }}
      style={style}
    >
      {isVue && (
        <div
          ref={(r) => {
            vueRef.current = r;
          }}
        />
      )}{' '}
      {/* vue组件占位 */}
      {isVue ? createVue() : createReact()}
    </div>
  );
};

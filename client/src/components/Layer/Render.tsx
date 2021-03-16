/* eslint-disable react/no-this-in-sfc */
import { ConfigProvider } from 'antd';
import Message from 'components/Message';
import React, { useRef, useEffect, useState } from 'react';
import { ComponentDevelopLib, ComponentStyle } from 'types';

interface RenderProps {
  props: any;
  styles: ComponentStyle;
  events: any;
  component: any;
  initFlag: boolean;
  developLib: ComponentDevelopLib
  onInitSize: (width: number, height: number) => void;
  onShow?: () => void;
  children?: any;
  style?: React.CSSProperties;
}

export default ({
  onInitSize,
  onShow,
  initFlag,
  props,
  styles,
  events,
  component,
  developLib,
  style
}: RenderProps) => {
  const ref = useRef<HTMLDivElement | null>();
  const vueRef = useRef<HTMLDivElement | null>();
  const vueApp = useRef<any>(); // vue 组件对象
  const [isInit, setIsInit] = useState(false);
  const isVue = (developLib === "Vue3" || developLib === "Vue2")

  useEffect(() => {
    setIsInit(true);
    if (onShow) {
      onShow();
    }
    // 返回react组件的内部长宽
    if (developLib === "React" && onInitSize) {
      onInitSize(ref!.current!.offsetWidth, ref!.current!.offsetHeight);
    }
    return () => {
      if (vueApp.current) {
        developLib === "Vue2" ? vueApp.current.$destroy() : vueApp.current.unmount(vueRef.current)
      }
    }
  }, []);

  /**
   * 生成react 组件
   * @param funComp
   */
  const createReact = () => {
    return React.createElement(component, {
      ...props,
      ...events,
      styles: { ...styles, x: undefined, y: undefined }
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
      Message.error('Vue没定义');
      return;
    }

    if (developLib === "Vue3") {
      return createVue3(Vue);
    }

    if (vueApp.current) {
      // 更新props
      Object.keys(props).forEach((key) => {
        Vue.set(vueApp.current, key, props[key]);
      });
      Vue.set(vueApp.current, 'styles', {
        ...styles,
        x: undefined,
        y: undefined
      });
      return;
    }

    vueApp.current = new Vue({
      el: vueRef.current,
      data: {
        ...props,
        styles: { ...styles, x: undefined, y: undefined }
      },
      destroyed () {
        vueApp.current = null;
      },
      mounted () {
        this.$nextTick(() => {
          // 返回vue组件的内部长宽
          onInitSize(this.$el.offsetWidth, this.$el.offsetHeight);
        });
      },
      render (createElement: any) {
        return createElement(component, {
          props: {
            ...this
          },
          on: {
            ...events
          }
        });
      }
    });
  };

  /**
   * 生成vue3组件
   * @param Vue
   */
  const createVue3 = (Vue:any) => {
    if (vueApp.current) {
      return;
    }

    const { createApp, h } = Vue;
    console.log('----------------', component);
    vueApp.current = createApp({
      // data: {
      //   ...props,
      //   styles: { ...styles, x: undefined, y: undefined }
      // },
      unmounted () {
        vueApp.current = null;
      },
      mounted () {
        this.$nextTick(() => {
          // 返回vue组件的内部长宽
          onInitSize(this.$el.offsetWidth, this.$el.offsetHeight);
        });
      },
      render () {
        return h(vueApp.current.component(component.name, component))
      }
    });
    // console.log('----------------------------', component);
    // vueApp.current.component(component.name, component);
    vueApp.current.mount(vueRef.current);
  }

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
      )}
      {isVue
        ? (
            createVue()
          )
        : (
        <ConfigProvider prefixCls="ant" iconPrefixCls="anticon">
          {createReact()}
        </ConfigProvider>
          )}
    </div>
  );
};

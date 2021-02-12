/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/**
 * 图层类，负责生成组件，控制组件的大小位置，请求数据
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { observer, inject } from 'mobx-react';
import { message } from 'antd';
import { cloneDeep } from 'lodash';
import ErrorCatch from 'components/ErrorCatch';
import eventer from 'common/eventer';
import { request } from 'common/network';
import { useSync } from 'common/stateTool';
import {
  ComponentStyle,
  ComponentStyleQuery,
  LayerInfo,
  ScreenStore
} from 'types';
import { buildCode } from 'common/util';
import { loadLib, LoadingComponent } from '../Loader';
import Render from './Render';
import styles from './index.module.scss';
import { DefaultLayerSize } from 'config';

function showHandlerError (layerName: string, error: any) {
  message.error(`${layerName}事件处理错误:${error.message}`);
  console.error(`${layerName}事件处理错误:${error.message}`);
}

function parseStyle (style: ComponentStyle) {
  const pureStye: any = {};
  const styleObj: any = style;
  Object.keys(style).forEach((key) => {
    if (key.indexOf('transform-') >= 0) {
      const fun = key.split('-')[1];
      pureStye.transform = pureStye.transform
        ? `${pureStye.transform} ${fun}(${styleObj[key]})`
        : `${fun}(${styleObj[key]})`;
    } else {
      pureStye[key] = styleObj[key];
    }
  });
  return pureStye;
}
/**
 * 解释数源中的参数
 * @param params
 */
export function parseParams (params: string) {
  if (!params) return {};
  // 替换${xxx}变量，变量会对应映射global的值 {"a":"${myname}"}会替换会{"a":global["myname"]}
  const globalObj: any = global;
  try {
    const regx = /"\${[\d\w_]+}"/g;
    const newParams = params.replace(regx, (match: string) => {
      const val = match.substring(3, match.length - 2);
      if (
        typeof globalObj[val] === 'object' ||
        typeof globalObj[val] === 'string'
      ) {
        return JSON.stringify(globalObj[val]);
      }
      return globalObj[val] === undefined ? null : globalObj[val];
    });
    return JSON.parse(newParams);
  } catch (e) {
    message.error('参数解释错误');
    return {};
  }
}

/**
 * 事件里的网络请求
 */
export function eventRequest (
  originUrl: string,
  method: string,
  params?: any,
  options?: any
) {
  return request(originUrl, method, params || {}, {
    prefix: '/',
    ...options
  });
}

export const LayerEvent = {
  onLoad: '__onLayerLoad__',
  onDataSource: '__onLayerData__',
  onUnload: '__onLayerUnload__'
};

interface LayerProps extends React.HTMLAttributes<Element> {
  data: LayerInfo;
  defaultWidth: number;
  defaultHeight: number;
  enable?: boolean;
  hide?: boolean;
  onSelected?: (
    data: LayerInfo,
    e?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  onReady?: (data: LayerInfo) => void;
  screenStore?: ScreenStore;
}

interface EventValue {
  style?: ComponentStyleQuery;
  props?: { [key: string]: any };
}

interface EventSync {
  event: string;
  args: any;
}

export default inject('screenStore')(
  observer(
    ({
      screenStore,
      data,
      enable = false,
      onSelected,
      onReady,
      defaultWidth,
      defaultHeight,
      ...restProps
    }: LayerProps) => {
      const targetRef = useRef<HTMLDivElement | null | undefined>();
      const initSizeFlag = useRef<boolean>(data.initSize);
      const dataSourceTimer = useRef<any>();
      // 事件回调返回值
      const [eventReturn, setEventReturn] = useState<EventValue>({
        style: {},
        props: {}
      });
      // 组件的事件处理方法
      const [compEventHandlers, setCompEventHandlers] = useState<any>({}); // 组件事件
      const [allEventHandlers, setAllEventHandlers] = useState<any>({}); // 所有事件
      // 数据源
      const [dataSource, setDataSource] = useState<any>();
      // 加载组件
      const [lib, setLib] = useState<any>();
      const [libLoading, setLibLoading] = useState(false);
      // 事件同步处理
      const [eventySync, setEventSync] = enable
        ? []
        : useSync<EventSync>(
          { event: '', args: [] },
          data.id
        );

      // 组件默认数据
      const defaultProps: any = {};
      const { component } = data;
      if (component && component.props) {
        Object.keys(component.props).forEach((key) => {
          defaultProps[key] = component.props
            ? component.props[key].default
            : undefined;
        });
      }

      // 事件同步发生变化
      useEffect(() => {
        if (eventySync && eventySync.event && allEventHandlers[eventySync.event]) {
          // 调用组件事件处理器
          componentEventsHandler(
            allEventHandlers[eventySync.event],
            ...eventySync.args
          );
        }
      }, [eventySync, allEventHandlers]);

      useEffect(() => {
        // 事件处理
        const allEvnet: any = {};
        const compEvent: any = {};
        const { events } = data;
        if (events) {
          Object.keys(events).forEach((key) => {
            let callFun: Function | null = null;
            try {
              callFun = events[key].code ? buildCode(events[key].code) : null;
            } catch (e) {
              showHandlerError(data.name, e);
            }

            if (!callFun || typeof callFun !== 'function') return;

            allEvnet[key] = callFun;

            if (
              key === LayerEvent.onLoad ||
              key === LayerEvent.onUnload ||
              key === LayerEvent.onDataSource
            ) {
              // 系统事件
              //  allEvnet[key] = callFun;
            } else {
              compEvent[key] = (...args: any[]) => {
                // 同步事件 编辑状态下不做同步
                if (events[key].isSync && setEventSync) {
                  setEventSync({ event: key, args });
                  return;
                }
                // 调用组件的事件处理
                callFun && componentEventsHandler(callFun, ...args);
              };
            }
          });
          setCompEventHandlers(compEvent);
          setAllEventHandlers(allEvnet);
        }

        // 加载三方组件
        if (component && component.origin === 2) {
          setLibLoading(true);
          loadLib(component, (comp: any) => {
            setLib(comp);
            setLibLoading(false);
          });
        }

        // 组件加载完成事件回调
        if (allEvnet[LayerEvent.onLoad]) {
          runEventHandler(allEvnet[LayerEvent.onLoad]);
        }

        // 请求数据源
        if (data.api && data.api.url) {
          const { url, method, params, interval } = data.api;
          const formatParams = parseParams(JSON.stringify(params));
          requestDataSource(
            url,
            method,
            formatParams,
            allEvnet[LayerEvent.onDataSource]
          );
          if (interval && interval > 0) {
            // 轮询
            clearInterval(dataSourceTimer.current);
            dataSourceTimer.current = setInterval(
              requestDataSource,
              interval,
              url,
              method,
              formatParams,
              allEvnet[LayerEvent.onDataSource]
            );
          }
        }

        return () => {
          clearInterval(dataSourceTimer.current);
          // 组件卸载事件回调
          if (allEvnet[LayerEvent.onUnload]) {
            runEventHandler(allEvnet[LayerEvent.onUnload]);
          }
        };
      }, []);

      /**
       * 请求数据源
       */
      const requestDataSource = (
        api: string,
        method: string,
        params?: any,
        onLayerData?: Function
      ) => {
        const newParams = params || {};

        eventRequest(api, method, newParams).then((res) => {
          setDataSource(res);
          // 数据加载完成事件处理
          if (onLayerData) {
            runEventHandler(onLayerData, res);
          }
        });
      };

      /**
       * 执行事件处理方法
       * @param callback
       * @param args
       */
      const runEventHandler = (callback: Function, ...args: any[]) => {
        try {
          callback.call(createThis(), ...args);
        } catch (e) {
          showHandlerError(data.name, e);
        }
      };

      /**
       * 组件事件处理
       * @param callback
       */
      const componentEventsHandler = useCallback(
        async (callback: Function, ...args: any[]) => {
          try {
            const self = createThis();
            const rel = await callback.call(self, ...args);
            if (rel) {
              // 事件返回数据处理
              setEventValue(rel);
            }
          } catch (e) {
            showHandlerError(data.name, e);
          }
        },
        [eventReturn, data]
      );

      /**
       * 手动设置事件返回结果，主要用于异步操作
       */
      const setEventValue = useCallback(
        (rel: EventValue) => {
          if (rel) {
            // eslint-disable-next-line no-shadow
            const { style, props } = rel;
            eventReturn.style = {
              ...eventReturn.style,
              ...style
            };
            eventReturn.props = {
              ...eventReturn.props,
              ...props
            };
            setEventReturn({ ...eventReturn });
          }
        },
        [eventReturn]
      );

      /**
       * 创建事件处理方法this
       */
      const createThis = () => {
        return {
          ...mergeArgs(),
          eventer,
          request: eventRequest,
          setValue: setEventValue
        };
      };

      /**
       * 合并props和style后的值
       */
      const mergeArgs = () => {
        const mergeProps = cloneDeep({
          ...defaultProps,
          ...data.props, // 组件属性配置
          ...dataSource, // 数据源返回
          ...eventReturn.props // 事件处理返回
        });

        const mergeStyle = cloneDeep({
          ...data.style, // 样式设置
          top: undefined,
          left: undefined,
          zIndex: undefined,
          transform: undefined,
          ...eventReturn.style // 事件返回改变样式
        });

        return { props: mergeProps, style: parseStyle(mergeStyle) };
      };

      /**
       * 选中组件
       */
      const onClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          e.stopPropagation();
          if (onSelected) {
            onSelected(data, e);
          }
        },
        [data]
      );

      /**
       * 组件初始化大小
       */
      const onInitSize = useCallback(
        (width: number, height: number) => {
          if (onReady) {
            onReady(data);
          }

          if (initSizeFlag.current || data.initSize || !enable) {
            return;
          }

          initSizeFlag.current = true;
          const setWidth = width && height ? width : defaultWidth;
          const setHeight = width && height ? height : defaultHeight;
          if (data && data.style && data.style.x && data.style.y && data.id) {
            const left =
              data.style.x + DefaultLayerSize.width / 2 - setWidth / 2;
            const top =
              data.style.y + DefaultLayerSize.height / 2 - setHeight / 2;

            targetRef.current!.style.width = `${setWidth}px`;
            targetRef.current!.style.height = `${setHeight}px`;
            targetRef.current!.style.transform = `translate(${left}px, ${top}px)`;

            data.style.x = left;
            data.style.y = top;
            data.style.width = setWidth;
            data.style.height = setHeight;

            // 更新图层
            screenStore!.updateLayer(data.id, {
              style: { ...data.style },
              initSize: true
            });
          }
        },
        [data]
      );

      const mergeParms = mergeArgs();

      return (
        <div
          {...restProps}
          className={styles.layer}
          ref={(ref) => {
            targetRef.current = ref;
          }}
          style={{
            width: data.style.width,
            height: data.style.height,
            transform: `translate(${data.style.x}px, ${data.style.y}px)`,
            zIndex: data.style.z,
            display:
              !enable && (data.isHide || data.groupHide) ? 'none' : 'block',
            opacity: enable && (data.groupHide || data.isHide) ? 0.2 : 1,
            overflow:
              screenStore!.resizeing &&
              screenStore!.currLayer &&
              screenStore!.currLayer.id === data.id
                ? 'hidden'
                : 'visible'
          }}
          onMouseDown={onClick}
          id={data.id}
        >
          <ErrorCatch>
            {lib && (
              <Render
                onInitSize={onInitSize}
                isVue={lib.default && lib.default.render}
                component={lib.default}
                initFlag={data.initSize}
                props={mergeParms.props}
                styles={mergeParms.style}
                events={compEventHandlers}
                style={{
                  ...parseStyle(data.style),
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  pointerEvents: enable && data.eventLock ? 'none' : undefined,
                  x: undefined,
                  y: undefined,
                  z: undefined
                }}
              />
            )}
            {libLoading && <LoadingComponent />}
          </ErrorCatch>
        </div>
      );
    }
  )
);

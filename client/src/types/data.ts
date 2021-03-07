import { CSSProperties } from 'react';

export interface ComponentStyle extends CSSProperties {
  scale?: number;
  rotate?: string;
  z: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ComponentProps {
  [propsName: string]: {
    type?: any;
    comment?: string;
    default?: any;
  };
}

export interface ComponentEvents {
  [eventName: string]: {
    comment?: string;
  };
}

export interface ComponentInfo {
  id?: string;
  title: string;
  libName: string;
  coverImg?: string;
  coverUrl?: string;
  type: number;
  createTime?: string;
  updateTime?: string;
  createUser?: string;
  // path:string;
  origin: number;
  props?: ComponentProps;
  events?: ComponentEvents;
  version: string;
}

export interface ComponentCategory {
  id: string;
  name: string;
  value: string;
  img?: string;
}

export interface LayerEvents {
  [key: string]: { code: string; isSync: boolean };
}

/**
 * 图层信息
 */
export interface LayerInfo {
  id: string;
  name: string;
  // screenId: string;
  // componentId: string; // 新增时必填
  component: ComponentInfo; // 详情时返回
  initSize: boolean;
  api?: {
    url: string;
    method: string;
    interval?: number;
    params?: {
      [key: string]: any;
    };
  } | null;
  props?: { [key: string]: any };
  events?: LayerEvents;
  eventLock?: boolean; // 事件锁定，锁定后图层内组件不能交互
  data?: Object;
  style: ComponentStyle;
  hide?: boolean;
  lock?: boolean;
  updateFlag?: string | number; // 组件更新标识，用于优化组件渲染，组件更新后值会变
  group?: string;
  groupLock?: boolean;
  groupHide?: boolean;
  anime?: {
    translateX?: number;
    translateY?: number;
    width?: number;
    height?: number;
    rotate?: number;
    scale?: number;
    opacity?: number;
    loop?: number;
    duration?: number;
    delay?: number;
    easing?: string;
    direction?: string;
    autoplay?: boolean;
  };
  reloadKey?: number; // 强制刷新
}

export interface ScreenLayout extends CSSProperties {
  width: number;
  height: number;
}

export type LayerQuery = { [P in keyof LayerInfo]?: LayerInfo[P] };
export type ComponentStyleQuery = {
  [P in keyof ComponentStyle]?: ComponentStyle[P];
};

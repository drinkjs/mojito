import { CSSProperties } from 'react';

 {};

declare global {
  
  type Callback = (...args)=>any

  type ScreenInfo = {
    id: string;
    name: string;
    projectId: string;
    createAt: string;
    updateAt: string;
    layout?: string;
    coverImg?: string;
  }

  type ScreenDetail = {
    id: string;
    name: string;
    style: ScreenStyle;
    layers?: LayerInfo[];
    project: ProjectDto;
    dataSources?: DatasourceInfo[]
  }

  type ComponentTypeTree = {
    id: string;
    name: string;
    icon: string;
    children?: ComponentTypeTree[];
    pid?: string;
  }

  type ComponentInfo = {
    id?: string;
    title: string;
    name: string;
    coverImg?: string;
    coverUrl?: string;
    type: string;
    createTime?: string;
    updateTime?: string;
    createUser?: string;
    // path:string;
    origin: number;
    props?: ComponentProps;
    events?: ComponentEvents;
    version: string;
    developLib: ComponentDevelopLib;
    dependencies?: string[];
  }

  type LayerInfo = {
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
    props?: Record<string, any>;
    events?: LayerEvents;
    eventLock?: boolean; // 事件锁定，锁定后图层内组件不能交互
    data?: Record<string, any>;
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
    relativePosition?: {
      x?: RelativePosition,
      y?: RelativePosition
    } // 相对位置
  }

  type LayerQuery = { [P in keyof LayerInfo]?: LayerInfo[P] }

  type ComponentStyleQuery = {
    [P in keyof ComponentStyle]?: ComponentStyle[P];
  };

  type DatasourceInfo = {
    id?: string
    type: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    database?: string;
  }

  type ObjectParams = Record<string, any>;

 interface ComponentStyle extends CSSProperties {
  scale?: number;
  rotate?: string;
  z: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

 interface ComponentProps {
  [propsName: string]: {
    type?: any;
    name?: string;
    comment?: string;
    default?: any;
  };
}

 interface ComponentEvents {
  [eventName: string]: {
    name?: string;
    comment?: string;
  };
}

 type ComponentDevelopLib = 'React' | 'Vue2' | 'Vue3';

 interface ComponentInfo {
  id?: string;
  title: string;
  name: string;
  coverImg?: string;
  coverUrl?: string;
  type: string;
  createTime?: string;
  updateTime?: string;
  createUser?: string;
  // path:string;
  origin: number;
  props?: ComponentProps;
  events?: ComponentEvents;
  version: string;
  developLib: ComponentDevelopLib;
  dependencies?: string[];
}

 interface ComponentCategory {
  id: string;
  name: string;
  value: string;
  img?: string;
}

 interface LayerEvents {
  [key: string]: { code: string; isSync: boolean };
}
 interface RelativePosition {
  layerId: string;
  offset: number;
  positionType: "left" | "right" | "top" | "bottom";
}

/**
 * 图层信息
 */
 interface LayerInfo {
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
  data?: Record;
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
  relativePosition?: {
    x?: RelativePosition,
    y?: RelativePosition
  } // 相对位置
}

 interface DatasourceInfo {
  id?: string
  type: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  database?: string;
}

 interface ScreenStyle extends CSSProperties {
  width: number;
  height: number;
}

 type LayerQuery = { [P in keyof LayerInfo]?: LayerInfo[P] };
 type ComponentStyleQuery = {
  [P in keyof ComponentStyle]?: ComponentStyle[P];
};

}
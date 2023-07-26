import { CSSProperties } from 'react';

 export {};

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

  type ComponentPackInfo = {
    id:string,
    name:string,
    version:string,
    external?:Record<string, string>,
    components:{export:string, name:string}[],
    type:string,
    packUrl:string,
    createAt?:Date
  }

  type ComponentInfo = {
    export: string;
    name: string;
    packId:string;
  }

  type ComponentOptions = {
    name: string,
    cover?:string,
    version?: string;
    props?: Record<string, ComponentProps>
    events?:Record<string, {
      name?:string,
      description?:string
    }>,
  }

  type LayerInfo = {
    id: string;
    name: string;
    component: ComponentInfo; // 详情时返回
    isFirst?: boolean;
    api?: {
      url: string;
      method: string;
      interval?: number;
      params?: {
        [key: string]: any;
      };
    } | null;
    props?: Record<string, any>;
    eventHandler?: LayerEvent;
    eventLock?: boolean; // 事件锁定，锁定后图层内组件不能交互
    data?: Record<string, any>;
    style: ComponentStyle;
    hide?: boolean;
    lock?: boolean;
    group?: string;
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
  name: string;
	type: "string" | "number" | "boolean" | "object" | "array";
	description?: string;
	default?: any;
}

interface ComponentPropsOptions extends ComponentProps{
  layerId:string
  key: string
}

 interface ComponentEvents {
  [eventName: string]: {
    name?: string;
    comment?: string;
  };
}
 interface ComponentInfo {
  id?: string;
  name: string;
  type: string;
}

 interface ComponentCategory {
  id: string;
  name: string;
  value: string;
  img?: string;
}

interface MojitoComponent {
	framework?:{
		name:"react"|"vue",
		version:string
	}
  component:any,
  componentInfo:ComponentInfo,
  mount(container: Element | DocumentFragment, props?: Record<string, any>, onMount?:(props?:Record<string, any>)=>void):void,
  unmount():void
  setProps(newProps:any):void
	getProps():Record<string, any>
	getComponentId():string
	setEvent(eventName:string, callback:(...args:any[])=>any):any
}

export type Constructor<T = any> = new (...args: any[]) => T;

type AlignType = "left" | "right" | "top" | "bottom" | "v-center" | "h-center";

 interface LayerEvent {
  [key: string]: { sourceCode?: string, buildCode?:string, isSync?: boolean };
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
  component: ComponentInfo; // 详情时返回
  isFirst?: boolean;
  api?: {
    url: string;
    method: string;
    interval?: number;
    params?: {
      [key: string]: any;
    };
  } | null;
  props?: { [key: string]: any };
  eventHandler?: LayerEvent;
  eventLock?: boolean; // 事件锁定，锁定后图层内组件不能交互
  data?: Record;
  style: ComponentStyle;
  hide?: boolean;
  lock?: boolean;
  group?: string;
  // anime?: {
  //   translateX?: number;
  //   translateY?: number;
  //   width?: number;
  //   height?: number;
  //   rotate?: number;
  //   scale?: number;
  //   opacity?: number;
  //   loop?: number;
  //   duration?: number;
  //   delay?: number;
  //   easing?: string;
  //   direction?: string;
  //   autoplay?: boolean;
  // };
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
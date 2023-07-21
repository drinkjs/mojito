import * as babel from '@babel/standalone';


export * from "./typeis"

export function formatJson (json: any) {
  if (json === undefined || typeof json === 'string') return json;
  try {
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return '';
  }
}

export function parseJson (json: string): any {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

// 查找父节点
export function getTreeAllParent (tree: any[], id: any, filterSelf?: boolean) {
  let temp: any[] = [];
  const forFn = function (childrenTree: any[], itemId: any) {
    for (let i = 0; i < childrenTree.length; i++) {
      const item = childrenTree[i];
      if (item.id === itemId) {
        temp.push(item);
        forFn(tree, item.pid);
        break;
      } else if (item.children) {
        forFn(item.children, itemId);
      }
    }
  };
  forFn(tree, id);
  if (filterSelf) {
    temp = temp.filter((v) => v.id !== id);
  }
  return temp.reverse();
}

export function getTreeItem (tree: any[], id: any) {
  let rel: any = null;
  const forFn = function (childrenTree: any[]) {
    for (let i = 0; i < childrenTree.length; i++) {
      const item = childrenTree[i];
      if (item.id === id) {
        rel = item;
        break;
      } else if (item.children) {
        forFn(item.children);
        if (rel !== null) {
          break;
        }
      }
    }
  };
  forFn(tree);
  return rel;
}

type DynamicFunction = (...args:any)=>any;

export function buildCode (code: string): DynamicFunction | null {
  if (!code) return null;
  const result = babel.transform(code, {
    presets: ['env'],
    sourceType: 'unambiguous'
  });
  // eslint-disable-next-line no-unused-vars
  const exports = {}; // fix exports is not defined
  // eslint-disable-next-line no-eval
  const fun: DynamicFunction = result.code ? eval(result.code) : null;
  return fun;
}

export function isEmpty (str: any): boolean {
  return str === undefined || str === null || str === '';
}

// 判断点p是否在正方形内
export function isPointInRect (rc: { x: number, y: number, width: number, height: number }, p: {x:number, y:number}) {
  const { x, y, width, height } = rc;
  return x <= p.x && p.x <= x + width &&
    y <= p.y && p.y <= y + height;
}

export const localCache = {
  get(key:string){
    const cache = localStorage.getItem(key);
    if(cache){
      try{
        return JSON.parse(cache);
      }catch{
        return cache;
      }
    }
  },

  set(key:string, value:any){
    if(typeof value === "object"){
      localStorage.setItem(key, JSON.stringify(value));
    }else{
      localStorage.setItem(key, value);
    }
  }
}

import * as babel from '@babel/standalone';
import * as typeis from './typeis';

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
export function getTreeParent (tree: any[], id: any) {
  const temp: any[] = [];
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
  return temp.reverse();
}

export function buildCode (code: string): Function | null {
  if (!code) return null;
  const result = babel.transform(code, {
    presets: ['env'],
    sourceType: 'unambiguous'
  });
  // eslint-disable-next-line no-unused-vars
  const exports = {}; // fix exports is not defined
  // eslint-disable-next-line no-eval
  const fun: Function = result.code ? eval(result.code) : null;
  return fun;
}

export function isEmpty (str: any): boolean {
  return str === undefined || str === null || str === '';
}

export { typeis };

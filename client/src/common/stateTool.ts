/* eslint-disable no-undef */
import { useState, useRef, useEffect, MutableRefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as events from 'events';
import WebSocketClient from 'common/network/WebSocketClient';
import { WebsocketEnable } from 'config';

const eventUrl = '/wss';

export const syncEventer = new events.EventEmitter();
syncEventer.setMaxListeners(1024);

interface SyncData {
  key: string;
  sender: string;
  state: any;
}

interface SyncPageData {
  key?: string;
  page: string;
  sender?: string;
  state: any;
}

interface SyncMessage {
  data: any;
  event: string;
}

interface JoinPageData {
  page: string;
  pageId: string;
  master?: boolean;
}

class SyncHelper {
  websocket?: WebSocketClient;

  connectNum = 0;

  pathnameNum = 0;

  isMaster = false;

  joinPages: JoinPageData[] = [];

  pageId = uuidv4();

  currPage?: string;

  reconnectCallback?: Function;

  eventHandlers: Map<string, Function> = new Map();

  constructor () {
    if (!WebsocketEnable) return;
    this.websocket = new WebSocketClient(`ws://${window.location.host}/ws`); // 需要配置websocket代理
    this.websocket.connect();
    this.websocket.on('connect', () => {
      if (this.connectNum > 0) {
        // 断开重连时重新
        if (this.reconnectCallback) this.reconnectCallback();
      }
      this.connectNum += 1;
    });

    //  服务器返回websokcet事件
    this.websocket.on('message', (msg: SyncMessage) => {
      console.log('websocket msg：', msg);
      const { data, event } = msg;
      switch (event) {
        case 'join':
          this.joinHandler(data);
          break;
        case 'sync':
          this.syncHandler(data);
          break;
        case 'syncPage':
          this.syncPageHandler(data);
          break;
        default:
          //   // const hadndler = this.eventHandlers.get(event);
          //   // if(hadndler){
          //   //   hadndler(data);
          //   // }else{
          //   //   console.error(`no [${event}] hander`)
          //   // }
          //   console.error(`no [${event}] hander`)
          break;
      }
      const hadndler = this.eventHandlers.get(event);
      if (hadndler) {
        hadndler(data);
      }
    });
  }

  on (event: string, callback: Function) {
    this.eventHandlers.set(event, callback);
  }

  removeEvent (event: string) {
    this.eventHandlers.delete(event);
  }

  onReconnect (callback: Function) {
    this.reconnectCallback = callback;
  }

  send (event: string, data?: any) {
    if (this.websocket) this.websocket.emit(`${eventUrl}/${event}`, data);
  }

  /**
   * 向服务器发送join消息
   * @param {*} params
   */
  joinPage (page: string, data: { room: string; [key: string]: any }) {
    this.currPage = page;
    this.send('join', { ...data, page, pageId: this.pageId });
  }

  /**
   * 同步组件状态
   * @param {SyncData} stateData
   */
  syncData (stateData: SyncData) {
    this.send('sync', stateData);
  }

  /**
   * 发送数据到指定页面下的组件
   * @param {*} data
   */
  sendDataToPage (page: string, state: object, key: string) {
    const data: SyncPageData = {
      page,
      state,
      key,
      sender: this.currPage
    };
    this.send('syncPage', data);
  }

  /**
   * join事件返回处理
   * @param {*} data
   */
  joinHandler (data: JoinPageData[]) {
    this.joinPages = data;
  }

  // eslint-disable-next-line class-methods-use-this
  syncHandler (data: SyncData) {
    syncEventer.emit(`RECV_SYNC_${data.key}`, data);
  }

  // eslint-disable-next-line class-methods-use-this
  syncPageHandler (data: SyncPageData) {
    syncEventer.emit(`RECV_SYNC_${data.key}`, data);
  }
}

const syncHelper = new SyncHelper();
const rootNode = document.getElementById('root');

export function useReconnect (callback: Function) {
  syncHelper.onReconnect(callback);
}

/**
 * 加入页面
 * @param page
 */
export function joinPage (room: string, data?: { [key: string]: any }) {
  const { pathname } = window.location;
  syncHelper.joinPage(pathname, { room, ...data });
}

/**
 * 发送数据到指定页面的组件
 * @param page
 * @param state
 * @param key
 */
export function sendDataToPage (page: string, state: object, key: string) {
  syncHelper.sendDataToPage(page, state, key);
}

/**
 * 发送自定义事件
 * @param event
 * @param data
 */
export function sendEvent (event: string, data?: any) {
  syncHelper.send(event, data);
}

/**
 * 自定义事件回调
 * @param event
 * @param callback
 */
export function onEvent (event: string, callback: Function) {
  syncHelper.on(event, callback);
}

/**
 * 删除自定义事件
 * @param event
 */
export function removeEvent (event: string) {
  syncHelper.removeEvent(event);
}

/**
 * 定义组件内部的同步状态
 * @param initialState
 * @param key 组件唯一标识，不传的话默认使用xpath作为唯一标识
 */
export function useSync<T> (
  initialState: T,
  key?: string
): [T, (data: Partial<T>) => void, MutableRefObject<HTMLAnchorElement>] {
  const ref = useRef<any>();
  const [value, setValue] = useState(initialState);
  const [xpath, setXpath] = useState<string>(key || '');
  const [sender] = useState(uuidv4());

  const onSync = (data: SyncData) => {
    if (sender !== data.sender) {
      setData(data.state);
    }
  };

  useEffect(() => {
    if (!xpath) {
      // 确保组件已构建完成
      setTimeout(() => {
        // eslint-disable-next-line no-unused-expressions
        if (ref.current && rootNode) {
          setXpath(getXPathForElement(ref.current, rootNode));
        }
      }, 1000);
    }
    if (xpath) {
      syncEventer.addListener(`RECV_SYNC_${xpath}`, onSync);
    }
    return () => {
      syncEventer.removeListener(`RECV_SYNC_${xpath}`, onSync);
    };
  }, [xpath]);

  const setData = (data: Partial<T>) => {
    setValue({ ...initialState, ...data });
  };

  const setSync = (data: Partial<T>) => {
    setData(data);
    let syncKey = xpath;
    if (!syncKey && rootNode) {
      syncKey = getXPathForElement(ref.current, rootNode);
      setXpath(syncKey);
    }
    syncHelper.syncData({ state: data, key: syncKey, sender });
  };

  return [value, setSync, ref];
}

function getXPathForElement (el: Node, root: Node) {
  let xpath = '';
  let pos;
  let tempitem2;

  while (el !== root && el !== document.documentElement) {
    pos = 0;
    tempitem2 = el;
    while (tempitem2) {
      if (tempitem2.nodeType === 1 && tempitem2.nodeName === el.nodeName) {
        // If it is ELEMENT_NODE of the same name
        pos += 1;
      }
      tempitem2 = tempitem2.previousSibling;
    }
    xpath = `${el.nodeName}[${pos}]/${xpath}`;
    // eslint-disable-next-line no-param-reassign
    if (el && el.parentNode) {
      el = el.parentNode;
    }
  }
  xpath = `${root.nodeName}/${xpath}`;
  xpath = xpath.substr(0, xpath.length - 1);
  return xpath;
}

import { WebSocketClient } from './network';
import eventer from "./eventer"

const eventUrl = '/ws';
const WsPrefix = "/ws";
const WebsocketEnable = true;

const syncEventer = eventer;

export interface SyncData {
  // 接收数据的图层id
  to: string[];
  data: Record<string, any>;
}

interface SyncMessage {
  data: Record<string, any>;
  event: string;
}

class SyncHelper {
  websocket?: WebSocketClient;

  connectNum = 0;

  pathnameNum = 0;

  reconnectCallback?: (...args: any) => any;

  constructor() {
    if (!WebsocketEnable) return;
    this.websocket = new WebSocketClient(`ws://${window.location.host}${WsPrefix}`); // 需要配置websocket代理
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
      const { data, event } = msg;
      syncEventer.emit(event, data);
    });
  }

  on(event: string, callback: (data: any) => any) {
    syncEventer.on(event, callback)
  }

  off(event: string, callback: (data: any) => any) {
    syncEventer.off(event, callback)
  }

  send(event: string, data?: any) {
    if (this.websocket) this.websocket.emit(`${eventUrl}/${event}`, data);
  }

  /**
   * 向服务器发送join消息
   * @param {*} pageId
   */
  join(pageId: string) {
    this.send('join', { pageId });
  }

  leave() {
    this.send('leave');
  }

  /**
   * 同步组件状态
   * @param {SyncData} stateData
   */
  sync(stateData: SyncData) {
    this.send('sync', stateData);
  }
}

export const syncHelper = new SyncHelper();
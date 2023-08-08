/**
 * Created by a on 2017/6/1.
 */

export type EventCallback<T=any> = (arg:T)=>any

export class WebSocketClient {
  msgQueue: string[];
  connected: boolean;
  url: any;
  socket:WebSocket|null;
  accClose: boolean;
  onMessage: EventCallback<MessageEvent> | null;
  onOpen: EventCallback<Event> | null;
  onClose: EventCallback | null;
  onError: EventCallback | null;
  maxMess: number;

  constructor (url:string) {
    // 消息队列
    this.msgQueue = [];
    this.connected = false;
    this.url = url;
    this.socket = null;
    // 是否手动关闭，手动关闭不自动重连
    this.accClose = false;

    this.onMessage = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;

    // 消息队列的最大长度
    this.maxMess = 500;

    this.loop();
  }

  // 连接
  connect (onOpen?:EventCallback) {
    if (this.connected) {
      return;
    }
    if (onOpen) {
      this.onOpen = onOpen;
    }
    this.accClose = false;
    this.socket = new WebSocket(this.url);
    this.socket.onopen = (event) => {
      this.connected = true;
      if (this.onOpen) {
        this.onOpen(event);
      }
      console.info(`${this.url}连接成功`);
    };

    this.socket.onclose = (event) => {
      this.connected = false;
      if (this.onClose) {
        this.onClose(event);
      }
      console.info(`${this.url}连接关闭`);
      if (!this.accClose) {
        this.connect();
      }
    };

    this.socket.onerror = (event) => {
      this.connected = false;
      console.info(`${this.url}连接错误`);
      if (this.onError) this.onError(event);
    };

    this.socket.onmessage = (msg) => {
      if (this.onMessage) {
        this.onMessage(JSON.parse(msg.data));
      }
    };
  }

  // 发送数据
  emit (event:string, data:any) {
    if (this.connected && this.socket) {
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      if (this.msgQueue.length > this.maxMess) {
        this.msgQueue.slice(0, 1);
      }
      this.msgQueue.push(JSON.stringify({ event, data }));
    }
  }

  on (event:string, callback:EventCallback) {
    switch (event) {
      case 'message':
        this.onMessage = callback;
        break;
      case 'connect':
        this.onOpen = callback;
        break;
      case 'close':
        this.onClose = callback;
        break;
      case 'error':
        this.onError = callback;
        break;
      default:
        console.warn('no event:', event);
        break;
    }
  }

  // 关闭
  close (msg?:string) {
    this.accClose = true;
    this.socket?.close(1000, msg);
  }

  // 消息队列循环
  loop = () => {
    // window.cancelAnimationFrame(this.loopId);
    if (this.connected && this.msgQueue.length > 0 && this.socket) {
      const item = this.msgQueue.shift();
      if(item){
        this.socket.send(item);
      }
    }
    window.requestAnimationFrame(this.loop);
  };
}

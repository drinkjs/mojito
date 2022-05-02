import { OPEN } from "ws";
import {
  Controller,
  Get,
  Query,
  WebSocketServer,
  Ws,
  WebsocketEvent,
  WsClient,
  WebsocketEmitter,
  BaseController,
} from "ngulf";
// import WebsocketEmitter, {
//   WebsocketEvent,
//   WsClient,
// } from "../core/WebsocketEmitter";

interface JoinPage {
  room: string;
  screenName: string;
  projectName: string;
  pageId: string;
  page: string;
  master?: boolean;
}

interface StateSyncMsg {
  key: string;
  sender: string;
  state: { [key: string]: any };
}

interface SyncPageMsg {
  page: string;
  data: { [key: string]: any };
}

@Controller("/ws")
export default class ScreenSyncController extends BaseController {
  @WebSocketServer()
  private wss!: WebsocketEmitter;

  /**
   * http对外接口，房间的所有页面
   * @param params
   */
  @Get("/connects")
  async getPageByRoom (@Query("room") room: string) {
    const clients = this.getRoomClients(room);
    const pages: JoinPage[] = [];
    clients.forEach((v) => {
      const clientData: JoinPage = v.data;
      if (!pages.find((p) => p.page === clientData.page)) {
        pages.push(clientData);
      }
    });
    return this.success(pages);
  }

  /**
   * 页面断开连接
   * @param event
   */
  @Ws(WebsocketEvent.disconnect)
  disconnect (target: WsClient) {
    const { room } = target;
    this.sendAll(room, {
      event: "join",
      data: this.wss.getClientsByRoom(room).map((client) => client.data),
    });
  }

  /**
   * 页面加入房间
   */
  @Ws("/join")
  join (data: JoinPage, target: WsClient) {
    // data里的数据
    const { room } = data;
    if (room) {
      target.room = room;
    }
    target.data = data;
    // this.sendAll(room, {
    //   event: "join",
    //   data: this.wss.getClientsByRoom(room).map((client) => client.data),
    // });
  }

  /**
   * 组件状态同步
   */
  @Ws("/sync")
  sync (data: StateSyncMsg, target: WsClient) {
    const { room, data: pageInfo } = target;
    this.sendAll(
      room,
      {
        event: "sync",
        data,
      },
      pageInfo.page,
      target.id
    );
  }

  /**
   * 数据同步到指定页面
   * @param {*} event 事件对象
   */
  @Ws("/syncPage")
  syncPage (data: SyncPageMsg, target: WsClient) {
    const { room } = target;
    this.sendAll(
      room,
      {
        event: "syncPage",
        data,
      },
      data.page
    );
  }

  /**
   * 房间连接信息
   * @param room
   * @param page
   */
  getRoomClients (room: string, page?: string) {
    const clients = this.wss.getClientsByRoom(room) || [];
    return page
      ? clients.filter((val) => val.data && val.data.page === page)
      : clients;
  }

  /**
   * 向同一房间的所有连接发送消息
   * @param {object} msg 消息对象
   * @param {string} room 房间号
   * @param {object} page 页面信息
   * @param {string} filterId 过滤客户端id
   */
  sendAll (room: string, msg: any, page?: string, filterId?: string) {
    // 发送信息到客户端
    const clients = this.getRoomClients(room, page);
    clients.forEach((client) => {
      if (client.id !== filterId) this.sendMessage(client, msg);
    });
  }

  /**
   * 向指定连接发送消息
   * @param {object} client 客户端websocket连接对象
   * @param {object} msg 消息对象
   */
  sendMessage (client: WsClient, msg: any) {
    try {
      if (client && client.socket && client.socket.readyState === OPEN) {
        const msgString = JSON.stringify(msg);
        client.socket.send(msgString, (err: any) => {
          if (err) {
            console.error(err);
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

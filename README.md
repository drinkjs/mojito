<p align="center">
  <a href="http://mojito.drinkjs.com">
    <img height="200" src="./client/public/logo-black.svg">
  </a>
</p>
<p align="center">Mojito数据可视化编辑器是使用可视化交互的方式来分析并展示庞杂数据的产品</p>

## ✨ 特性

- 点选、拖拽、缩放的可视化操作
- 群组/解散、撤销/重做、图层显示/隐藏、锁定/解锁、对齐和排序
- 支持使用React/Vue开发上传自定义组件
- 支持通过HTTP数据源接入，轮询
- 组件可视化样式配置
- 组件可视化动画配置
- 事件系统可以进行组件间通讯，页面下钻，数据源解释等各种复杂业务场景
- 事件同步实现跨终端大屏联动交互
- 100%开源，支持私有化部署

## ⚙️ 安装
### 环境要求
- Node.js >= 10.16.0
- MongoDB >= 4.2.12

```bash
git clone https://github.com/drinkjscom/mojito.git
```
### 启动后端
打开server/config/index.ts修改MongoDB相关连接信息
```bash
cd server
npm install --registry=https://registry.npm.taobao.org
npm run dev
```

### 启动前端
```bash
cd client
npm install --registry=https://registry.npm.taobao.org
npm start
```


### 文档
[http://mojito.drinkjs.com/docs](http://mojito.drinkjs.com/docs)
### 演示
[http://mojito.drinkjs.com](http://mojito.drinkjs.com)
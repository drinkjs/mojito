## ⚙️ 安装
Mojito采用前后端分离的方式开发，前端React+Antd, 后端Node+fastify+MongoDB，开始前请确保你已安装Node.js >= 10.16.0 和MongoDB >= 4.2.12
```bash
git clone https://github.com/drinkjscom/mojito.git
```
### 后端
打开server/config/index.ts修改MongoDB相关连接信息
```bash
cd server
npm install --registry=https://registry.npm.taobao.org
npm run dev
```

### 前端
```bash
cd client
npm install --registry=https://registry.npm.taobao.org
npm start
```

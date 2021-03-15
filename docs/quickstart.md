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

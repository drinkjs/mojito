## 📊 组件开发指南

Mojito的组件开发主要分为三步

1. 使用React 16+ / Vue2 / Vu3作为基础框架开发的组件 
2. 编写描述文件declare.json，编写规范请参考[declare.json](/declare.md)
3. 使用UMD的方式打包组件，将打包好的组件连同declare.json压缩成zip上传到平台

为了减少组件的大小，加快组件的加载速度，建议修改Webpack的externals，依赖在declare.json里引入

```js
externals: {
  react: "React",
  "react-dom": "ReactDOM",
  vue: "Vue",
  "element-ui":"ElementUI",
}
```

为了方便开发，这里提供三个开发骨架供大家参考

* [**mojito-compack**](https://github.com/drinkjs/mojito-compack)：基于React的开发骨架

* [**mojito-compack-vue**](https://github.com/drinkjs/mojito-compack-vue)：基于Vue2的开发骨架

* [**mojito-compack-vue3**](https://github.com/drinkjs/mojito-compack-vue3)：基于Vue3的开发骨架

骨架是使用[**Storybook**](https://storybook.js.org/)构建的，在开发过程中可以很方便的调试组件

![storybook](/assets/storybook.jpg)

### 安装依赖
```bash
npm install --registry=https://registry.npm.taobao.org
```
### 本地调试
```bash
npm start
```
### 组件打包
```bash
npm run build

打包完成后会组件会输出到dist目录，将相应组件的zip上传到平台
```
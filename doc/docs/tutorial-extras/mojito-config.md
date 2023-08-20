---
sidebar_position: 2
---

# mojito.config.js

打包是基于Webpack的，所以大部分配置与Webpack相同

```js
module.exports = {
  // 指定要打包的所有组件
  entry: "./src/components/**/*.tsx",
  output:{
    // 打包后组件的资源访问路径，比如 www.xxx.yyy/public/xxx@v1.x.x/mojito-pack.json
    publicPath:"/public",
  },
  externals: {
    // 作用跟Webpack externals一致
    "echarts": ['http://cdn.staticfile.org/echarts/5.4.3/echarts.min.js', 'echarts'],
    "lodash": ['https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js', '_'],
  },
}
```


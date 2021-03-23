## 📃 declare.json编写规范

```js
{
  "name": "BarChart", // 组件名，全局唯一， 必填
  "version": "v1.0.0", // 组件版本号，必填
  "title": "基础柱状图", // 组件显示名称，非必填，可以在上传时修改
  "dependencies": [ // 组件依赖的js和css，依赖js库必须使用UMD方式，如果你的组件只依赖React和Antd则无需添加
    "https://cdn.staticfile.org/echarts/5.0.2/echarts.min.js",
    "https://cdn.staticfile.org/lodash.js/4.17.20/lodash.min.js"
  ],
  "events": { // 以下是组件事件 没有可不写
    "onCreated": { // 事件名
      "name": "图表初始化完成", // 事件中文名 非必填
      "comment": "图表初始化完成事件(echart)=>void" // 事件描述 非必填
    }
  },
  "props": { // 以下组件属性，没有可不写
    "data": { // 属性名
      "name": "数据", // 属性中文名 非必填
      "type": "array", // 属性数据类型，支持"string", "object", "array", "number", "boolean", "image"和枚举(写法：["value1", "value2", "value3"])，默认string
      "comment": "图表数据[{name:类型1, value:100}, ...]", // 属性描述 非必填
      "default": [ // 属性默认值，默认undefined
        {
          "name": "Mon",
          "value": 120
        },
        {
          "name": "Tue",
          "value": 200
        },
        {
          "name": "Wed",
          "value": 150
        },
        {
          "name": "Thu",
          "value": 80
        },
        {
          "name": "Fri",
          "value": 70
        },
        {
          "name": "Sat",
          "value": 110
        },
        {
          "name": "Sun",
          "value": 130
        }
      ]
    },
    "linearGradient": {
      "name": "柱体颜色",
      "type": "array",
      "comment": "渐变色",
      "default": [
        "#ff0000",
        "#330000"
      ]
    },
    "option": {
      "name": "echarts配置",
      "type": "object",
      "comment": "echarts配置，具体参考echarts官网",
      "default": {}
    }
  }
}

```
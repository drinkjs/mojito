---
sidebar_position: 3
---

# CreatePack

定义Mojito组件

```js
import { CreatePack } from "@drinkjs/mojito-react-pack";
import cover from "./bar-simple.webp"

const BarChart:React.FC<{ 
  colors: string[], 
  data: { name: string, value: number }[], 
  options: any,
  onClick?: (item: { name: string, value: number })=>void 
}> = ()=>{
  ...
}

export default CreatePack(
  BarChart, // 要输出的组件
  {
    name: "基本柱状图", // 组件名称
    category: "柱状图", // 组件分类
    cover, // 组件封面图
    // 定义props
    props: {
      colors: { 
        name:"颜色",
        type:"array",
      },
      data: {
        name: "数据",
        description: '图表数据[{name:"类型", value:100}, ...]',
        type: "array",
        default: [
          {
            name: "Mon",
            value: 120,
          },
          {
            name: "Tue",
            value: 200,
          },
          {
            name: "Wed",
            value: 150,
          },
          {
            name: "Thu",
            value: 80,
          },
          {
            name: "Fri",
            value: 70,
          },
          {
            name: "Sat",
            value: 110,
          },
          {
            name: "Sun",
            value: 130,
          },
        ]
      },
      options: {
        name: "配置",
        type: "object",
        description: "Echarts配置，具体参考echarts官网"
      },
    },
    // 定义事件
    events:{
      onClick: {
        name: "点击",
        description: "点击柱子时回调，(item: { name: string, value: number })=>void"
      }
    }
  }
)
```
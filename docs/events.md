## 交互事件
Mojito具备事件处理的能力，让您对组件有更加全面的控制，能够做些轻业务开发，如：数据字段的转换、基本的流程控制，组件间的通讯等等，ps：不建议在Mojito上做重业务开发，重业务的应用最好还是本地写代码。

每个图层都会有以下4个系统事件+组件的自定义事件(参考[组件开发指南](develop.md))

- 组件加载：组件加载时回调，可以在这里做一些初始化工作，比如监听事件。
- 组件显示：组件已生成DOM并显示到页面上，您可以在这里进一步控制组件的样式，实现动画效果等。
- 组件销毁：组件在页面上移除时回调，可以在这里做清理工作，比如移除事件监听，清理定时器等
- 数据源加载：如果图层配置了数据源，当结果返回时回调，在这里您可以对数据源进行处理

此外为了方便开发，每个事件处理方法都会注入一个this对象，this对象有以下属性和方法

- layer：当前图层的DOM对象
- styles：当前图层的样式
- props: 当前图层组件的属性
- currAnime: 当前的动画效果对象，可以用来控制播放或停止
- eventer: 事件对象，可以用来跟其他图层通讯，用法参考[EventEmitter](https://nodejs.org/api/events.html)
- router: 路由对象，可以用来实现页面跳转，用法参考[react-router](https://reactrouter.com/web/api/Hooks/usehistory)的useHistory 
- anime: 动画对象，可以对图层实现更复杂动画效果，用法参考[anime.js](https://github.com/juliangarnier/anime)
- request: 网络请求方法，原型：(url:string, method:"get"|"post", params?:object, options?:object) => Promise
- setProps: 可以用来设置组件的属性，原型： (props:object) => void
- setStyles: 可以用来设置图层的样式，原型： (styles:object) => void
- setHide: 控制图层显示/隐藏，原型： (hide:boolean) => void

事件处理的方法和普通的js方法没区别，支持使用es6/7语法，但有几个点需要注意事
1. 不支持import
2. 事件处理方法不能使用箭头函数，箭头函数没有this
3. 不能使用export default导出方法
4. 调试时是没有与当前图层绑定的，所以调用setProps和setStyles不会看到效果

demo: 
1. 配置数据源https://disease.sh/v3/covid-19/jhucsse （获取全球主要城市累计新冠感染数）
2. 在【数据源加载】事件里将数据源转换成【地球】组件barData属性

![demo](/assets/events-demo.jpg)

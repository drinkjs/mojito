/*
 * @Author: ouruiting
 * @Date: 2020-05-26 14:17:30
 * @LastEditors: ouruiting
 * @LastEditTime: 2020-05-26 14:54:39
 * @Description: file content
 */

import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
// import "antd/dist/antd.module.scss";
import 'antd/dist/antd.dark.module.scss'; // 引入官方提供的暗色 less 样式入口文件
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';
import '../resources/css/base.module.scss';
import App from '../routes';

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <App />
  </ConfigProvider>,
  document.getElementById('root')
);

import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AppRouter } from './routes';
import './App.less';

function App () {
  return (
    <ConfigProvider
      locale={zhCN}
      prefixCls="mojito"
      iconPrefixCls="mojito-anticon"
    >
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;

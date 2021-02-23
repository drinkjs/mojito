import React from 'react';
import { ConfigProvider, Modal, message, notification } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { AppRouter } from './routes';
import './App.less';

const prefixCls = 'mojito';

message.config({
  prefixCls: `${prefixCls}-message`
});

notification.config({
  prefixCls
});

Modal.config({
  rootPrefixCls: prefixCls
});

function App () {
  return (
    <ConfigProvider
      locale={zhCN}
      prefixCls={prefixCls}
      // iconPrefixCls="mojitoicon"
    >
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;

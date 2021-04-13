import { message } from 'antd';

export default {
  success: (msg: string) => {
    message.success({ content: msg, key: msg });
  },
  error: (msg: string) => {
    message.error({ content: msg, key: msg });
  },
  warning: (msg: string) => {
    message.warning({ content: msg, key: msg });
  }
};

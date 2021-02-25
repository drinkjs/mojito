import IconFont from 'components/IconFont';
import React from 'react';
import { toast } from 'react-toastify';

const Tips = (icon: string, msg: string) => {
  return (
    <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
      <IconFont type={icon} style={{ fontSize: 18, marginTop: '4px' }} />
      <span style={{ marginLeft: 12 }}>{msg}</span>
    </div>
  );
};

export default {
  success: (msg: string) => {
    toast.dark(Tips('icon-success', msg));
  },
  error: (msg: string) => {
    toast.dark(Tips('icon-prompt_', msg));
  },
  warning: (msg: string) => {
    toast.dark(Tips('icon-warning', msg));
  }
};

/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable prefer-template */
import * as React from 'react';
import { Spin, Skeleton } from 'antd';

const loadingLib = {};

// 加载页面组件
// export default (component) => {
//   return React.lazy(() => component());
// };

export const lazyLoader = (component) => {
  return React.lazy(() => component());
};

export const loadLib = ({ libName, version }, onload) => {
  const exportName = libName + version;
  // 已经有其他图层在加载，避免重复加载
  if (loadingLib[exportName]) {
    // 检测加载完成没有
    setTimeout(() => {
      loadLib({ libName, version }, onload);
    }, 200);
    return;
  }
  const bundleUrl = `${
    LIB_URI || ''
  }/${exportName}/bundle.js?t=${Math.random()}`;
  if (global[exportName]) {
    onload(global[exportName]);
    return;
  }

  loadingLib[exportName] = true;

  const script = document.createElement('script');
  script.src = bundleUrl;
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    loadingLib[exportName] = false;
    onload(global[exportName]);
  };
  document.body.appendChild(script);
};

export const loadCDN = (cdns, onload) => {
  let loaded = 0;
  if (!cdns || cdns.length === 0) {
    onload();
    return;
  }
  cdns.forEach((url) => {
    if (url.substring(url.length - 4) === '.css') {
      const headID = document.getElementsByTagName('head')[0];
      const link = document.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      headID.appendChild(link);
      link.href = url;
      loaded++;
      if (loaded >= cdns.length) {
        onload();
      }
    } else {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onload = () => {
        // eslint-disable-next-line no-unused-vars
        loaded++;
        if (loaded >= cdns.length) {
          onload();
        }
      };
      document.body.appendChild(script);
    }
  });
};

export const LoadingComponent = (props) => {
  const { skeleton, style } = props;
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        ...style
      }}
    >
      {skeleton ? <Skeleton active /> : <Spin />}
    </div>
  );
};

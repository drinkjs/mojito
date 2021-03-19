/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable prefer-template */
import React from 'react';
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
    REACT_APP_LIB_URI || ''
  }/${exportName}/bundle.js?t=${Math.random()}`;
  if (global[exportName]) {
    onload(global[exportName]);
    return;
  }

  loadingLib[exportName] = true;

  const script = document.createElement('script');
  script.src = bundleUrl;
  script.crossorigin = 'anonymous';
  script.onload = () => {
    loadingLib[exportName] = false;
    onload(global[exportName]);
  };
  document.body.appendChild(script);
};

export const getLibScriptTag = (libName, version) => {
  const exportName = libName + version;
  const nodeList = document.body.querySelectorAll('script');
  for (let i = 0; i < nodeList.length; ++i) {
    const item = nodeList[i];
    if (item.src.indexOf(exportName) !== -1) {
      return item;
    }
  }
};

export const unloadLibScriptTag = (libName, version) => {
  const tag = getLibScriptTag(libName, version);
  if (tag) {
    document.body.removeChild(tag);
  }
  return tag;
};

export const reloadLib = (libName, version, onLoad) => {
  const tag = unloadLibScriptTag(libName, version);
  if (tag) {
    global[libName + version] = null;
    loadLib({ libName, version }, onLoad);
  }
};

export const getScriptBySrc = (src) => {
  const nodeList = document.body.querySelectorAll('script');
  for (let i = 0; i < nodeList.length; ++i) {
    const item = nodeList[i];
    if (item.src === src) {
      return item;
    }
  }
};

/**
 * 加载项目CDN
 * @param {*} cdns
 * @param {*} onload
 * @returns
 */
export const loadCDN = (cdns, onload) => {
  if (!cdns || cdns.length === 0) {
    onload();
    return;
  }
  const nodeList = document.body.querySelectorAll('script');
  const getScriptByUrl = (url) => {
    for (let i = 0; i < nodeList.length; ++i) {
      const item = nodeList[i];
      if (item.src === url) {
        return item;
      }
    }
  };
  const head = document.getElementsByTagName('head')[0];
  const linkList = head.querySelectorAll('link');
  const getLinkByUrl = (url) => {
    for (let i = 0; i < linkList.length; ++i) {
      const item = linkList[i];
      if (item.href === url) {
        return item;
      }
    }
  };

  const promises = cdns.map((url) => {
    if (url.substring(url.length - 4) === '.css') {
      return new Promise((resolve, reject) => {
        if (!getLinkByUrl(url)) {
          const link = document.createElement('link');
          link.type = 'text/css';
          link.rel = 'stylesheet';
          head.appendChild(link);
          link.href = url;
          link.onload = () => {
            resolve('ok');
          };
        } else {
          resolve('ok');
        }
      });
    } else {
      if (getScriptByUrl(url)) {
        return new Promise((resolve, reject) => {
          resolve('ok');
        });
      }
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.crossorigin = 'anonymous';
        script.onload = () => {
          resolve('ok');
        };
        document.body.appendChild(script);
      });
    }
  });

  Promise.all(promises)
    .then((result) => {
      onload();
    })
    .catch((error) => {
      console.log(error);
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

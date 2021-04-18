/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable prefer-template */
import React from 'react';
import { Spin, Skeleton } from 'antd';
import Message from 'components/Message';

const loadingLib = {};

// 加载页面组件
// export default (component) => {
//   return React.lazy(() => component());
// };

export const lazyLoader = (component) => {
  return React.lazy(() => component());
};

export const loadLib = ({ name, version }, onload) => {
  const exportName = name + version;
  // 已经有其他图层在加载，避免重复加载
  if (loadingLib[exportName]) {
    // 检测加载完成没有
    setTimeout(() => {
      loadLib({ name, version }, onload);
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
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    loadingLib[exportName] = false;
    onload(global[exportName]);
  };
  script.onerror = () => {
    Message.error(`${exportName}加载失败`)
  }
  document.body.appendChild(script);
};

export const getLibScriptTag = (name, version) => {
  const exportName = name + version;
  const nodeList = document.body.querySelectorAll('script');
  for (let i = 0; i < nodeList.length; ++i) {
    const item = nodeList[i];
    if (item.src.indexOf(`${exportName}/bundle.js`) !== -1) {
      return item;
    }
  }
};

export const unloadLibScriptTag = (name, version) => {
  const tag = getLibScriptTag(name, version);
  if (tag) {
    document.body.removeChild(tag);
  }
};

export const reloadLib = (name, version, onLoad) => {
  unloadLibScriptTag(name, version);
  global[name + version] = null;
  loadLib({ name, version }, onLoad);
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
  const getScriptByUrl = (nodeList, url) => {
    for (let i = 0; i < nodeList.length; ++i) {
      const item = nodeList[i];
      if (item.src === url) {
        return item;
      }
    }
  };

  const getLinkByUrl = (linkList, url) => {
    for (let i = 0; i < linkList.length; ++i) {
      const item = linkList[i];
      if (item.href === url) {
        return item;
      }
    }
  };

  const promises = cdns.map((url) => {
    if (url.substring(url.length - 4) === '.css') {
      const head = document.getElementsByTagName('head')[0];
      const linkList = head.querySelectorAll('link');
      return new Promise((resolve, reject) => {
        if (!getLinkByUrl(linkList, url)) {
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
      const nodeList = document.body.querySelectorAll('script');
      return new Promise((resolve, reject) => {
        if (getScriptByUrl(nodeList, url)) {
          return resolve('ok');
        }
        const script = document.createElement('script');
        script.src = url;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          resolve('ok');
        };
        script.onerror = () => {
          Message.error(`${url}加载失败`)
          reject(new Error(`${url}加载失败`));
        }
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

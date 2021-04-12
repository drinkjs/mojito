import React from 'react';
import { Image as AntImage } from 'antd';
import noImg from 'resources/images/noImg.png';

const Image = (props: any) => {
  return (
    <AntImage preview={false} placeholder={false} fallback={noImg} {...props} />
  );
};

export default Image;

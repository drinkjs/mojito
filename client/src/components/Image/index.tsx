import * as React from 'react';
import { Image as Img } from 'antd';
import noImg from 'resources/images/noImg.png';

const Image = (props: any) => {
  return (
    <Img preview={false} placeholder={false} fallback={noImg} {...props} />
  );
};

export default Image;

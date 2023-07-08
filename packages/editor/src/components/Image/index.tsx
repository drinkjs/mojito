import { Image as AntImage, ImageProps } from 'antd';
import noImg from '@/assets/noImg.png';

const Image = (props: ImageProps) => {
  return (
    <AntImage preview={false} placeholder={false} fallback={noImg} {...props} />
  );
};

export default Image;

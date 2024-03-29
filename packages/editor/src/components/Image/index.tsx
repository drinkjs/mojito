import { Image as AntImage, ImageProps } from 'antd';
import empty from '@/assets/empty.jpg';

const Image = (props: ImageProps) => {
  return (
    <AntImage preview={false} placeholder={false} fallback={empty} {...props} />
  );
};

export default Image;

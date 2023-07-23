import { Image as AntImage, ImageProps } from 'antd';
import empty from '@/assets/empty.png';

const Image = (props: ImageProps) => {
  return (
    <AntImage preview={false} placeholder={false} fallback={empty} {...props} />
  );
};

export default Image;

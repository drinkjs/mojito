import React, { useCallback, useState } from 'react';
import { message, Upload } from 'antd';
import {
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { UploadListType } from 'antd/lib/upload/interface';
import styles from './index.module.css';
import { localCache } from '@/common/util';

interface Props {
  onChange?: (filePath: string | undefined) => void;
  action?: string;
  data?: any;
  value?: string;
  showFile?: boolean;
  children?: any;
  listType?: UploadListType;
  onProcess?: () => void;
}

const UploadImg = (props: Props) => {
  const {
    action = '/api/upload/image',
    showFile = true,
    listType = 'picture-card',
    onProcess
  } = props;
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const { value, onChange } = props;

  React.useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const beforeUpload = 
(file: RcFile) => {
      if (
        file.type === 'image/png' ||
        file.type === 'image/jpg' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/gif'
      ) {
        return true;
      }
      message.error('只支持上传图片格式文件');
      setImageUrl(undefined);
      onChange && onChange(undefined);
      return false;
    };

  const onUpload = (info:any) => {
      if (info.file.status === 'done') {
        //  上传完成
        setLoading(false);
        const { response } = info.file;
        if (response.code === 0) {
          const { path } = response.data;
          setImageUrl(path);
          onChange && onChange(path);
        } else {
          // 上传失败
          message.error(response.msg);
          onChange && onChange(undefined);
        }
      } else {
        setLoading(true);
        if (onProcess) {
          onProcess();
        }
      }
    };

  const handleRemove = useCallback((e: React.MouseEvent<any>) => {
    e.stopPropagation();
    setImageUrl(undefined);
    onChange && onChange(undefined);
  }, []);

  const showPre = () => {
    if (!showFile) return null;

    return imageUrl
      ? (
      <div className={styles.upload}>
        <img src={imageUrl} alt="cover" style={{ width: '100%' }} />
        <div className={styles.toolBar}>
          <a onClick={handleRemove}>
            <DeleteOutlined />
          </a>
        </div>
      </div>
        )
      : (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
        );
  };

  const { data, children } = props;

  return (
    <Upload
      listType={listType}
      className="avatar-uploader"
      accept=".png,.jpg,.gif,.jpeg"
      showUploadList={false}
      action={action}
      beforeUpload={beforeUpload}
      onChange={onUpload}
      data={data}
      headers={{
        // TODO 需要换成真实用户验证信息
        "x-token": localCache.get("token")
      }}
    >
      {showPre()}
      {children}
    </Upload>
  );
};

export default UploadImg;

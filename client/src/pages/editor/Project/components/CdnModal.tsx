/* eslint-disable react/display-name */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Table, Button, Space } from 'antd';
import { ModalProps } from 'antd/lib/modal';

let addId = 0;

interface Props extends ModalProps {
  value?: string[];
  projectName?: string;
  onConfirm: (cdn?: string[]) => void;
}

export default (props: Props) => {
  const {
    visible,
    confirmLoading,
    onCancel,
    onConfirm,
    value,
    projectName,
  } = props;
  const [cdnData, setCdnData] = useState<
    { id: number | string; url: string }[]
  >([]);

  useEffect(() => {
    const data =
      value && value.length > 0
        ? value.map((v) => ({ id: v, url: v }))
        : [{ id: ++addId, url: '' }];
    setCdnData(data);
  }, [value]);

  /**
   * 新增一行
   */
  const onAdd = useCallback(() => {
    cdnData.push({ id: ++addId, url: '' });
    setCdnData([...cdnData]);
  }, [cdnData]);

  /**
   * 删除一行
   */
  const onRemove = useCallback(
    (id: string) => {
      const data = cdnData.filter((v) => v.id !== id);
      setCdnData(data && data.length > 0 ? data : [{ id: ++addId, url: '' }]);
    },
    [cdnData]
  );

  const onChange = useCallback(
    (id, val) => {
      const data = cdnData.find((v) => v.id === id);
      if (data) {
        data.url = val;
      }
      setCdnData([...cdnData]);
    },
    [cdnData]
  );

  const onOk = useCallback(() => {
    const data = cdnData.filter((v) => !!v.url);
    onConfirm(data ? data.map((v) => v.url) : []);
  }, [cdnData]);

  const columns = [
    {
      title: 'CDN',
      dataIndex: 'url',
      key: 'url',
      render: (url: string, data: any) => {
        return (
          <Input
            value={url}
            placeholder="https://xxx.com/xxx.min.js"
            onChange={(e) => {
              onChange(data.id, e.target.value);
            }}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (id: string) => {
        return (
          <Button
            type="primary"
            ghost
            onClick={() => {
              onRemove(id);
            }}
          >
            删除
          </Button>
        );
      },
    },
  ];

  return (
    <Modal
      title={`【${projectName}】CDN设置`}
      visible={visible}
      // onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
      confirmLoading={confirmLoading}
      maskClosable={false}
      width={650}
      bodyStyle={{ maxHeight: 500, overflow: 'auto' }}
      footer={
        <Space>
          <Button ghost onClick={onAdd}>
            增加一行
          </Button>
          <Button ghost onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" onClick={onOk}>
            确定
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={cdnData}
        pagination={false}
        rowKey="id"
      />
    </Modal>
  );
};

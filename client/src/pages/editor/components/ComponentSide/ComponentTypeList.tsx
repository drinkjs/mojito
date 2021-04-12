import {
  Table,
  Button,
  Space,
  Modal,
  ModalFuncProps,
  Form,
  Cascader,
  Input
} from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useState } from 'react';
import { ComponentStore } from 'types';
import { getTreeParent } from 'common/util';
import IconFont from 'components/IconFont';
import { toJS } from 'mobx';

interface Props extends ModalFuncProps {
  componentStore?: ComponentStore;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

const columns = [
  {
    title: '分类名称',
    dataIndex: 'name',
    key: 'name',
    // eslint-disable-next-line react/display-name
    render: (text: string, recond: any) => {
      return (
        <div>
          {recond.icon && <IconFont type={recond.icon} />}
          <span style={{ marginLeft: '12px' }}>{text}</span>
        </div>
      );
    }
  },
  {
    title: '操作',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    // eslint-disable-next-line react/display-name
    render: (text: string, recond: any) => {
      return (
        <Space>
          <Button type="primary" size="small">
            编辑
          </Button>
          <Button size="small">删除</Button>
        </Space>
      );
    }
  }
];

export default inject('componentStore')(
  observer(({ componentStore, ...restProps }: Props) => {
    const [form] = Form.useForm();
    // eslint-disable-next-line no-unused-vars
    const [value, setValue] = useState<any>();
    const [showAdd, setShowAdd] = useState(false);

    const onCancel = () => {
      setShowAdd(false);
    };

    return (
      <div style={{ width: '650px', maxHeight: '500px', overflow: 'auto' }}>
        <div style={{ paddingBottom: '12px', textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              setShowAdd(true);
            }}
          >
            {' '}
            新增
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={componentStore?.typeTree}
          pagination={false}
          showHeader={false}
        />
        <Modal
          visible={showAdd}
          onCancel={onCancel}
          title={'新增分类'}
          zIndex={9999}
        >
          <Form id="addComponentTypes" {...layout} form={form} preserve={false}>
            <Form.Item
              label="父级类型"
              name="type"
              rules={[{ required: false, message: '' }]}
              initialValue={
                value && value.type
                  ? getTreeParent(
                    toJS(componentStore!.typeTree),
                    value.type
                  ).map((v) => v.id)
                  : undefined
              }
            >
              <Cascader
                fieldNames={{ label: 'name', value: 'id' }}
                options={componentStore!.typeTree}
                placeholder="请选择父级类型"
                getPopupContainer={(target) =>
                  document.getElementById('addComponentTypes') || target
                }
                allowClear
              />
            </Form.Item>
            <Form.Item
              label="分类名称"
              name="name"
              rules={[{ required: true, message: '此项不能为空' }]}
              // initialValue={}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item
              label="图标"
              name="icon"
              rules={[{ required: true, message: '此项不能为空' }]}
              // initialValue={}
            >
              <Input placeholder="请输入图标" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  })
);

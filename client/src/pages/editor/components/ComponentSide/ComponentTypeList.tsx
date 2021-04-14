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
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ComponentStore, ComponentTypeTree } from 'types';
import { getTreeItem, getTreeAllParent } from 'common/util';
import IconFont from 'components/IconFont';
import { toJS } from 'mobx';
import Message from 'components/Message';

interface Props extends ModalFuncProps {
  componentStore?: ComponentStore;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

export default inject('componentStore')(
  observer(({ componentStore, ...restProps }: Props) => {
    const [form] = Form.useForm();
    // eslint-disable-next-line no-unused-vars
    const [value, setValue] = useState<ComponentTypeTree>();
    const [parentValue, setParentValue] = useState<string[]>();
    const [showAdd, setShowAdd] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

    const columns = [
      {
        title: '分类名称',
        dataIndex: 'name',
        key: 'name',
        // eslint-disable-next-line react/display-name
        render: (text: string, recond: ComponentTypeTree) => {
          return (
            <div>
              <IconFont type={recond.icon || 'icon-zidingyi'} />
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
        render: (text: string, recond: ComponentTypeTree) => {
          return (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  onEdit(recond);
                }}
              ></Button>
              <Button
                type="link"
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  onRemove(recond);
                }}
              ></Button>
            </Space>
          );
        }
      }
    ];

    const onCancel = () => {
      setShowAdd(false);
      setValue(undefined);
      setParentValue(undefined);
    };

    const onSave = () => {
      form.validateFields().then((values) => {
        const newValues = {
          ...values,
          pid: values.pid ? values.pid[values.pid.length - 1] : undefined,
          id: value ? value.id : undefined
        };
        if (value && value.id) {
          componentStore?.updateType(newValues).then(() => {
            onCancel();
          });
        } else {
          componentStore?.addType(newValues).then(() => {
            onCancel();
          });
        }
      });
    };

    const onRemove = (recond: ComponentTypeTree) => {
      if (recond.children && recond.children.length > 0) {
        Message.error(`${recond.name}下存在多个子类，请先删除子类`);
        return;
      }
      modal.confirm({
        title: `确定删除${recond.name}?`,
        zIndex: 2000,
        onOk: () => {
          componentStore!.removeType(recond.id);
        },
        onCancel: () => {}
      });
    };

    const onEdit = (recond: ComponentTypeTree) => {
      setValue(recond);
      setShowAdd(true);
      const pv = getTreeAllParent(
        toJS(componentStore!.typeTree),
        recond.id,
        true
      );
      if (pv.length > 0) {
        setParentValue(pv.map((v) => v.id));
      } else {
        setParentValue(undefined);
      }
    };

    const filterOpts = () => {
      const tree = toJS(componentStore!.typeTree);
      if (!value?.pid) {
        return tree.filter((v) => v.id !== value?.id);
      }
      const pItem = getTreeItem(tree, value?.pid);
      if (pItem && pItem.children) {
        // 过滤自身节点
        pItem.children = pItem.children.filter((v: any) => v.id !== value?.id);
      }
      return tree;
    };

    return (
      <div
        style={{
          width: '650px',
          maxHeight: '500px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ paddingBottom: '12px', textAlign: 'right' }}>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setShowAdd(true);
            }}
            icon={<PlusOutlined />}
          ></Button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <Table
            columns={columns}
            dataSource={componentStore?.typeTree}
            pagination={false}
            showHeader={false}
            rowKey="id"
          />
        </div>
        <Modal
          visible={showAdd}
          onCancel={onCancel}
          onOk={onSave}
          title={value ? '编辑分类' : '新增分类'}
          destroyOnClose
          zIndex={9988}
          confirmLoading={componentStore?.addTypeLoading}
        >
          <Form id="addComponentTypes" {...layout} form={form} preserve={false}>
            <Form.Item
              label="分类名称"
              name="name"
              rules={[{ required: true, message: '此项不能为空' }]}
              initialValue={value?.name}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item
              label="父级类型"
              name="pid"
              rules={[{ required: false, message: '' }]}
              initialValue={parentValue}
            >
              <Cascader
                fieldNames={{ label: 'name', value: 'id' }}
                options={value ? filterOpts() : componentStore!.typeTree}
                placeholder="请选择父级类型"
                getPopupContainer={(target) =>
                  document.getElementById('addComponentTypes') || target
                }
                allowClear
                changeOnSelect
              />
            </Form.Item>
            <Form.Item
              label="图标"
              name="icon"
              rules={[{ required: false, message: '此项不能为空' }]}
              initialValue={value?.icon}
            >
              <Input placeholder="请输入图标" />
            </Form.Item>
          </Form>
        </Modal>
        {contextHolder}
      </div>
    );
  })
);

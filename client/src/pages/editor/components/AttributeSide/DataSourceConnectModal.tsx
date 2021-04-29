import React, { useCallback, useState } from "react";
import { observer, inject } from "mobx-react";
import { ModalFuncProps } from "antd/lib/modal";
import { Modal, Form, Input, Button, Select, Space, InputNumber } from "antd";
import { ScreenStore } from "types";
import Message from "components/Message";
import { datasourceTest } from "services/datasource";
interface Props extends ModalFuncProps {
  onSubmit?: (values: any) => void;
  screenStore?: ScreenStore;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

export default inject("screenStore")(
  observer((props: Props) => {
    const { onSubmit, screenStore, visible, ...restProps } = props;
    const currLayer = screenStore!.currLayer;
    const [form] = Form.useForm();
    const [saveing, setSaveing] = useState(false);

    const onOk = useCallback(() => {
      form.validateFields().then((values) => {
        const { onOk } = props;
        if (onOk) {
          onOk(values);
        }
      });
    }, [form, props]);

    const onTest = useCallback(() => {
      form.validateFields().then((values) => {
        datasourceTest(values).then(() => {
          Message.success("连接成功");
        });
      });
    }, [form]);

    return (
      <Modal
        title="数据源设置"
        maskClosable={false}
        {...restProps}
        destroyOnClose
        visible={visible}
        // zIndex={9988}
        afterClose={() => {
          setSaveing(false);
        }}
        footer={
          <Space>
            <Button onClick={props.onCancel}>取消</Button>
            <Button onClick={onTest}>
              测试
            </Button>
            <Button type="primary" onClick={onOk} loading={saveing}>
              确定
            </Button>
          </Space>
        }
      >
        <Form
          id="addDataSourceConnectForm"
          {...layout}
          form={form}
          preserve={false}
        >
          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: "请选择类型" }]}
            initialValue={
              currLayer && currLayer.api ? currLayer.api.method : undefined
            }
          >
            <Select
              placeholder="请选择类型"
              getPopupContainer={(target) =>
                document.getElementById("addDataSourceConnectForm") || target
              }
            >
              <Select.Option value="mysql">mysql</Select.Option>
              <Select.Option value="mariadb">mariadb</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="主机"
            name="host"
            rules={[{ required: true, message: "请输入主机地址" }]}
            // initialValue={
            //   currLayer && currLayer.api ? currLayer.api.url : undefined
            // }
          >
            <Input placeholder="请输入主机地址" />
          </Form.Item>
          <Form.Item
            label="端口"
            name="port"
            rules={[{ required: true, message: "请输入端口" }]}
            // initialValue={
            //   currLayer && currLayer.api ? formatJson(currLayer.api.params) : ''
            // }
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: false, message: "请输入密码" }]}
          >
            <Input placeholder="请输入密码" />
          </Form.Item>
          {/* <Form.Item
            label="数据库"
            name="database"
            rules={[{ required: true, message: '请选择数据库' }]}
          >
            <Select
              placeholder="请选择数据库"
              getPopupContainer={(target) =>
                document.getElementById('addDataSourceConnectForm') || target
              }
              disabled
            >
              <Select.Option value="mysql">mysql</Select.Option>
              <Select.Option value="mariadb">mariadb</Select.Option>
            </Select>
          </Form.Item> */}
        </Form>
      </Modal>
    );
  })
);

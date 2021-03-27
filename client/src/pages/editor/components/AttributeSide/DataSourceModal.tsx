import React, { useCallback, useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { ModalFuncProps } from 'antd/lib/modal';
import { Modal, Form, Input, Button, Select, Space, InputNumber } from 'antd';
import CodeEditor from 'components/CodeEditor';
import { request } from 'common/network';
import { formatJson } from 'common/util';
import { ScreenStore } from 'types';
import Message from 'components/Message';
interface Props extends ModalFuncProps {
  onSubmit?: (values: any) => void;
  screenStore?: ScreenStore;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

export default inject('screenStore')(
  observer((props: Props) => {
    const { onSubmit, screenStore, visible, ...restProps } = props;
    const currLayer = screenStore!.currLayer;
    const [form] = Form.useForm();
    const [testData, setTestData] = useState<any>();
    const [testing, setTesting] = useState(false);
    const [saveing, setSaveing] = useState(false);

    useEffect(() => {
      if (!visible) setTestData('');
    }, [visible]);

    const parseParams = (params: string) => {
      if (!params) return {};
      // 替换${xxx}变量，变量会映射global的值 {"a":"${myname}"}会替换会{"a":global["myname"]}
      const globalObj: any = global;
      try {
        const regx = /"\${[\d\w_]+}"/g;
        const newParams = params.replace(regx, (match: string) => {
          const val = match.substring(3, match.length - 2);
          if (
            typeof globalObj[val] === 'object' ||
            typeof globalObj[val] === 'string'
          ) {
            return JSON.stringify(globalObj[val]);
          }
          return globalObj[val] === undefined ? null : globalObj[val];
        });
        return JSON.parse(newParams);
      } catch (e) {
        Message.error('参数解释错误');
        return {};
      }
    };

    const onOk = useCallback(() => {
      form.validateFields().then((values) => {
        let params = {};
        if (values.params) {
          try {
            params = JSON.parse(values.params);
          } catch (e) {
            Message.error('参数解释错误');
            return;
          }
        }
        if (!screenStore!.currLayer || !screenStore!.currLayer.id) return;
        setSaveing(true);
        screenStore!
          .updateLayer(
            screenStore!.currLayer.id,
            {
              api: {
                url: values.url,
                method: values.method,
                interval: values.interval,
                params
              }
            },
            { saveNow: true }
          )
          .then(() => {
            setSaveing(false);
            Message.success('保存成功');
            props.onCancel && props.onCancel();
          });
      });
    }, [form, props]);

    const onTest = useCallback(() => {
      form.validateFields().then((values) => {
        const params = parseParams(values.params);
        setTestData({});
        setTesting(true);
        request(values.url, values.method, params, {
          prefix: '',
          checkCode: false
        })
          .then((rel) => {
            setTestData(rel);
          })
          .catch((err) => {
            setTestData(err);
          })
          .finally(() => {
            setTesting(false);
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
            <Button onClick={onTest} loading={testing}>
              测试
            </Button>
            <Button type="primary" onClick={onOk} loading={saveing}>
              确定
            </Button>
          </Space>
        }
      >
        <Form id="addDataSourceForm" {...layout} form={form} preserve={false}>
          <Form.Item
            label="请求方式"
            name="method"
            rules={[{ required: true, message: '请选择请求方式' }]}
            initialValue={
              currLayer && currLayer.api ? currLayer.api.method : undefined
            }
          >
            <Select
              placeholder="请选择请求方式"
              getPopupContainer={(target) =>
                document.getElementById('addDataSourceForm') || target
              }
            >
              <Select.Option value="get">GET</Select.Option>
              <Select.Option value="post">POST</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="请求接口"
            name="url"
            rules={[{ required: true, message: '请输入请求接口' }]}
            initialValue={
              currLayer && currLayer.api ? currLayer.api.url : undefined
            }
          >
            <Input placeholder="请输入请求接口" />
          </Form.Item>
          <Form.Item
            label="请求参数"
            name="params"
            rules={[{ required: false, message: '请上传组件' }]}
            initialValue={
              currLayer && currLayer.api ? formatJson(currLayer.api.params) : ''
            }
          >
            <CodeEditor
              style={{
                width: '100%',
                height: '100px',
                border: '1px solid #303247'
              }}
            />
          </Form.Item>
          <Form.Item
            label="轮询(ms)"
            name="interval"
            rules={[{ required: false }]}
            initialValue={
              currLayer && currLayer.api && currLayer.api.interval
                ? currLayer.api.interval.toString()
                : undefined
            }
          >
            <InputNumber min={0} style={{ width: 150 }} />
          </Form.Item>
          {testData && (
            <Form.Item label="请求结果">
              <div
                style={{
                  background: '#1e1e1e',
                  height: '100px',
                  overflow: 'auto',
                  padding: '3px',
                  border: '1px solid #303247'
                }}
              >
                {JSON.stringify(testData)}
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  })
);

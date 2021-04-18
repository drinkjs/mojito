/* eslint-disable react/display-name */
import React, { useCallback, useState, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Input,
  Radio,
  InputNumber,
  Button,
  Form,
  Tooltip,
  Select,
  Modal,
  Collapse
} from 'antd';
import {
  ApiOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { toJS } from 'mobx';
import UploadImg from 'components/UploadImg';
import CodeEditor from 'components/CodeEditor';
import { formatJson, typeis, parseJson } from 'common/util';
import { ScreenStore } from 'types';
import DataSourceModal from './DataSourceModal';
import styles from './index.module.scss';

const { Panel } = Collapse;

// 枚举类型
function isenum (arg: any) {
  return typeis.isArray(arg) && arg.length > 0;
}

const typeComp: any = {
  object: () => (
    <CodeEditor style={{ width: '100%', height: '300px' }} mode="json" />
  ),
  array: () => (
    <CodeEditor style={{ width: '100%', height: '300px' }} mode="json" />
  ),
  string: () => <Input.TextArea autoFocus />,
  boolean: () => (
    <Radio.Group>
      <Radio value>true</Radio>
      <Radio value={false}>false</Radio>
    </Radio.Group>
  ),
  number: () => <InputNumber />,
  undefined: () => <Input />,
  enum: (opts: string[]) => (
    <Select>
      {opts.map((v) => (
        <Select.Option key={v} value={v}>
          {v}
        </Select.Option>
      ))}
    </Select>
  ),
  image: () => <UploadImg />
};
interface Props {
  screenStore?: ScreenStore;
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const { currLayer } = screenStore || {};
    const [form] = Form.useForm();
    const [dataSourceVisible, setDataSourceVisible] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

    const componentProps =
      screenStore!.currLayer && screenStore!.currLayer.component
        ? toJS(screenStore!.currLayer.component.props)
        : null;

    useEffect(() => {
      debounceFn.cancel();
    }, []);
    /**
     * 显示数据源弹框
     */
    const showDataSource = useCallback(() => {
      setDataSourceVisible(true);
    }, []);

    /**
     * 关闭数据源弹框
     */
    const closeDataSource = useCallback(() => {
      setDataSourceVisible(false);
    }, []);

    /**
     * 删除数据源
     */
    const removeDataSource = useCallback(() => {
      modal.confirm({
        title: '确定删除当前数据源设置?',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          if (
            screenStore &&
            screenStore.currLayer &&
            screenStore.currLayer.id
          ) {
            screenStore.updateLayer(screenStore.currLayer.id, { api: null });
          }
        }
      });
    }, []);

    /**
     * 保存属性
     */
    const debounceFn = useDebounceFn((changeValues: any, values: any) => {
      const keys = Object.keys(changeValues);
      const submitObj: any = {};
      if (!componentProps || !screenStore?.currLayer) {
        return;
      }
      keys.forEach((key) => {
        const propsType = componentProps[key].type;
        const toValue = changeValues[key];
        submitObj[key] = toValue;
        if (typeis.isString(propsType)) {
          if (propsType === 'object' || propsType === 'array') {
            submitObj[key] = parseJson(toValue);
          }
        } else if (typeis.isArray(propsType) && !isenum(propsType)) {
          submitObj[key] = parseJson(toValue);
        } else if (typeis.isObject(propsType)) {
          submitObj[key] = parseJson(toValue);
        }
        if (submitObj[key] === undefined || submitObj[key] === '') {
          submitObj[key] = componentProps[key].default;
        }
      });

      if (Object.keys(submitObj).length > 0) {
        screenStore.updateLayer(screenStore.currLayer.id, {
          props: {
            ...screenStore.currLayer.props,
            ...submitObj
          }
        });
      }
    }, { wait: 300 });

    const onPropsChange = debounceFn.run;

    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div className={styles.title}>
          {currLayer && currLayer.api && currLayer.api.method && (
            <p>
              {`${currLayer.api.method.toLocaleUpperCase()} ${
                currLayer.api.url
              }`}
            </p>
          )}
          <Button icon={<ApiOutlined />} onClick={showDataSource}>
            数据源设置
          </Button>
          {currLayer && currLayer.api && (
            <Button
              icon={<DeleteOutlined />}
              onClick={removeDataSource}
              style={{ marginLeft: '6px' }}
            >
              删除
            </Button>
          )}
        </div>
        {/* <div style={{textAlign:"right", padding:"10px 12px"}}>
          <Button type="primary" size="small">保存属性</Button>
        </div> */}
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            flexGrow: 1,
            flexBasis: 0
          }}
        >
          <Form
            form={form}
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            onValuesChange={onPropsChange}
            key={screenStore!.currLayer ? screenStore!.currLayer.id : '1'}
          >
            <Collapse>
              {componentProps &&
                currLayer &&
                Object.keys(componentProps).map((key) => {
                  const propsValue = componentProps[key];
                  let propsType: string = 'undefined';

                  if (typeis.isString(propsValue.type)) {
                    const types = Object.keys(typeComp);
                    const type = propsValue.type.toLocaleLowerCase();
                    if (types.indexOf(type) >= 0) {
                      propsType = type;
                    } else {
                      propsType = 'string';
                    }
                  } else if (typeis.isArray(propsValue.type)) {
                    propsType = propsValue.type.length > 0 ? 'enum' : 'array';
                  } else if (typeis.isObject(propsValue.type)) {
                    propsType = 'object';
                  } else if (typeis.isBoolean(propsValue.type)) {
                    propsType = 'boolean';
                  }

                  const typeComFun = typeComp[propsType];
                  const defValue = toJS(
                    currLayer.props && currLayer.props[key]
                      ? currLayer.props[key]
                      : propsValue.default
                  );
                  return (
                    <Panel
                      header={
                        <div>
                          {propsValue.name || key}
                          <Tooltip title={propsValue.comment || key}>
                            <span style={{ color: '#666', marginLeft: '6px' }}>
                              <ExclamationCircleOutlined />
                            </span>
                          </Tooltip>
                        </div>
                      }
                      key={key}
                    >
                      <Form.Item
                        label=""
                        style={{ marginBottom: 0 }}
                        preserve={false}
                        name={key}
                        rules={[{ required: false }]}
                        initialValue={
                          propsType === 'object' || propsType === 'array'
                            ? formatJson(defValue)
                            : defValue
                        }
                      >
                        {typeComFun
                          ? (
                              typeComFun(propsValue.type)
                            )
                          : (
                          <Input.TextArea />
                            )}
                      </Form.Item>
                    </Panel>
                  );
                })}
            </Collapse>
          </Form>
        </div>
        <DataSourceModal
          visible={dataSourceVisible}
          onCancel={closeDataSource}
        />
        {contextHolder}
      </div>
    );
  })
);

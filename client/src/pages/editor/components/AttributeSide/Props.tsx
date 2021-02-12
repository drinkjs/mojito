/* eslint-disable react/display-name */
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import {
  Input,
  Radio,
  InputNumber,
  Button,
  Form,
  Tooltip,
  Select,
  Modal
} from 'antd';
import {
  ApiOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { toJS } from 'mobx';
import UploadImg from 'components/UploadImg';
import Monaco from 'components/Monaco';
import { limitChange, formatJson, typeis, parseJson } from 'common/util';
import { ScreenStore } from 'types';
import DataSourceModal from './DataSourceModal';
import styles from './index.module.scss';

const { useCallback, useState } = React;

function isenum (arg: any) {
  return typeis.isArray(arg) && arg.length > 0;
}

const typeComp: any = {
  object: () => (
    <Monaco style={{ width: '100%', height: '200px' }} language="json" />
  ),
  array: () => (
    <Monaco style={{ width: '100%', height: '200px' }} language="json" />
  ),
  string: () => <Input.TextArea />,
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

    const componentProps =
      screenStore!.currLayer && screenStore!.currLayer.component
        ? toJS(screenStore!.currLayer.component.props)
        : null;

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
      Modal.confirm({
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
    const onPropsChange = useCallback(
      limitChange((changeValues: any, values: any) => {
        const keys = Object.keys(changeValues);
        const submitObj: any = {};
        if (!componentProps) {
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

        if (
          Object.keys(submitObj).length > 0 &&
          screenStore &&
          screenStore.currLayer &&
          screenStore.currLayer.id
        ) {
          screenStore.updateLayer(screenStore.currLayer.id, {
            props: {
              ...screenStore.currLayer.props,
              ...submitObj
            }
          });
        }
      }, 1000),
      [componentProps]
    );

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
                  <div className={styles.title} key={key}>
                    <p style={{ paddingBottom: '6px' }}>
                      {key}
                      <Tooltip title={propsValue.comment || key}>
                        <span style={{ color: '#666', marginLeft: '6px' }}>
                          <ExclamationCircleOutlined />
                        </span>
                      </Tooltip>
                    </p>
                    <Form.Item
                      label=""
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
                  </div>
                );
              })}
          </Form>
        </div>
        <DataSourceModal
          visible={dataSourceVisible}
          onCancel={closeDataSource}
        />
      </div>
    );
  })
);

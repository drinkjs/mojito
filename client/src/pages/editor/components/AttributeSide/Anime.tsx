/* eslint-disable react/display-name */
import React from 'react';
import { observer, inject } from 'mobx-react';
import anime from 'animejs';
import { Switch, InputNumber, Button, Form, Select, Row, Col } from 'antd';
import { ScreenStore } from 'types';

interface Props {
  screenStore?: ScreenStore;
}

const easings = [
  'linear',
  'easeInQuad',
  'easeInCubic',
  'easeInQuart',
  'easeInQuint',
  'easeInSine',
  'easeInExpo',
  'easeInCirc',
  'easeInBack',
  'easeInElastic',
  'easeInBounce',
  'easeOutQuad',
  'easeOutCubic',
  'easeOutQuart',
  'easeOutQuint',
  'easeOutSine',
  'easeOutExpo',
  'easeOutCirc',
  'easeOutBack',
  'easeOutElastic',
  'easeOutBounce',
  'easeInOutQuad',
  'easeInOutCubic',
  'easeInOutQuart',
  'easeInOutQuint',
  'easeInOutSine',
  'easeInOutExpo',
  'easeInOutCirc',
  'easeInOutBack',
  'easeInOutElastic',
  'easeInOutBounce'
];

const animeFields = [
  {
    label: 'X',
    name: 'translateX',
    render: () => (
      <InputNumber
        formatter={(val) => (val ? `${parseInt(`${val}`, 10)}px` : '')}
        parser={(val) => (val ? val.replace('px', '') : '')}
        style={{ width: '90%' }}
      />
    )
  },
  {
    label: 'Y',
    name: 'translateY',
    render: () => (
      <InputNumber
        formatter={(val) => (val ? `${parseInt(`${val}`, 10)}px` : '')}
        parser={(val) => (val ? val.replace('px', '') : '')}
        style={{ width: '90%' }}
      />
    )
  },
  {
    label: '角度',
    name: 'rotate',
    render: () => (
      <InputNumber
        formatter={(val) => (val ? `${parseInt(`${val}`, 10)}deg` : '')}
        parser={(val) => (val ? val.replace('deg', '') : '')}
        style={{ width: '90%' }}
      />
    )
  },
  {
    label: '缩放',
    name: 'scale',
    render: () => <InputNumber style={{ width: '90%' }} step={0.1} />
  },
  {
    label: '透明度',
    name: 'opacity',
    render: () => (
      <InputNumber style={{ width: '90%' }} min={0} max={1} step={0.1} />
    )
  },
  {
    label: '次数',
    name: 'loop',
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '持续',
    name: 'duration',
    render: () => (
      <InputNumber
        formatter={(val) => (val ? `${parseInt(`${val}`, 10)}ms` : '')}
        parser={(val) => (val ? val.replace('ms', '') : '')}
        style={{ width: '90%' }}
      />
    )
  },
  {
    label: '延时',
    name: 'delay',
    render: () => (
      <InputNumber
        formatter={(val) => (val ? `${parseInt(`${val}`, 10)}ms` : '')}
        parser={(val) => (val ? val.replace('ms', '') : '')}
        style={{ width: '90%' }}
      />
    )
  },
  {
    label: '效果',
    name: 'easing',
    render: () => (
      <Select style={{ width: '90%' }}>
        {easings.map((v) => (
          <Select.Option key={v} value={v}>
            {v}
          </Select.Option>
        ))}
      </Select>
    )
  }
];

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const [form] = Form.useForm();

    const onReset = () => {};

    const onSave = async () => {
      if (!screenStore!.currLayer) return;

      const values = await form.validateFields();
      console.log(values);
      // if (values.translateX === undefined &&
      //   values.translateY === undefined &&
      //   values.scale === undefined &&
      //   values.rotate === undefined &&
      //   values.opacity === undefined
      // ) {

      // }
      const disable = !!values.disable;
      delete values.disable;
      screenStore!.updateLayer(screenStore!.currLayer.id, {
        anime: {
          disable,
          params: values
        }
      });
    };

    const onTest = () => {
      form.validateFields().then((values) => {
        if (!screenStore!.currLayer) return;

        if (
          values.translateX === undefined &&
          values.translateY === undefined &&
          values.scale === undefined &&
          values.rotate === undefined &&
          values.opacity === undefined
        ) {
          return;
        }

        console.log('--------------------', values);

        const params = {
          ...values,
          targets: document.getElementById(screenStore!.currLayer.id)
        };

        anime(params);
      });
    };

    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          paddingLeft: '12px',
          marginTop: 12,
          flexDirection: 'column'
        }}
      >
        <Form
          form={form}
          key={screenStore!.currLayer ? screenStore!.currLayer.id : '1'}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Row>
            {animeFields.map((v) => {
              return (
                <Col key={v.name} span={12}>
                  <Form.Item
                    label={v.label}
                    name={v.name}
                    preserve={false}
                    rules={[{ required: false }]}
                  >
                    {v.render()}
                  </Form.Item>
                </Col>
              );
            })}
            <Col span={12}>
              <Form.Item
                name="disable"
                label="是否停用"
                valuePropName="checked"
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Button style={{ margin: '6px' }} onClick={onReset}>
            重置
          </Button>
          <Button type="primary" style={{ margin: '6px' }} onClick={onSave}>
            保存
          </Button>
          <Button style={{ margin: '6px' }} onClick={onTest}>
            测试
          </Button>
        </div>
      </div>
    );
  })
);

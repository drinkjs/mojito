/* eslint-disable react/display-name */
import React, { useEffect, useRef, useState } from 'react';
import { observer, inject } from 'mobx-react';
import anime from 'animejs';
import { CaretRightOutlined, StepForwardOutlined } from '@ant-design/icons';
import { InputNumber, Button, Form, Select, Row, Col, Switch } from 'antd';
import { ScreenStore } from 'types';
import Message from 'components/Message';
import { isEmpty } from 'common/util';

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
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: 'Y',
    name: 'translateY',
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '宽度',
    name: 'width',
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '高度',
    name: 'height',
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '角度',
    name: 'rotate',
    render: () => <InputNumber style={{ width: '90%' }} />
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
    default: 1,
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '持续',
    name: 'duration',
    default: 500,
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '延时',
    name: 'delay',
    render: () => <InputNumber style={{ width: '90%' }} />
  },
  {
    label: '效果',
    name: 'easing',
    render: () => (
      <Select style={{ width: '90%' }} allowClear>
        {easings.map((v) => (
          <Select.Option key={v} value={v}>
            {v}
          </Select.Option>
        ))}
      </Select>
    )
  },
  {
    label: '方向',
    name: 'direction',
    default: 'normal',
    render: () => (
      <Select style={{ width: '90%' }} allowClear>
        {['normal', 'reverse', 'alternate'].map((v) => (
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
    const [playing, setPlaying] = useState(false);
    const [saveing, setSaveing] = useState(false);
    const currAnime = useRef<anime.AnimeInstance | undefined | null>();
    const currElement = useRef<any>(
      screenStore!.currLayer
        ? document.getElementById(screenStore!.currLayer!.id)
        : undefined
    );

    useEffect(() => {
      return () => {
        if (currAnime.current && currElement.current) {
          currAnime.current.pause();
          currAnime.current.seek(0);
          currAnime.current = null;
          anime.remove(currElement.current);
        }
      };
    }, []);

    const onReset = () => {
      // const initialValues: any = {};
      // const layerAnime: any = screenStore!.currLayer?.anime;
      // animeFields.forEach((v) => {
      //   initialValues[v.name] = layerAnime
      //     ? layerAnime.params[v.name]
      //     : v.default;
      // });
      // form.setFieldsValue(initialValues);
      if (currAnime.current) {
        currAnime.current.pause();
        currAnime.current.seek(0);
      }
    };

    const onSave = async () => {
      if (!screenStore!.currLayer) return;

      const values = await form.validateFields();
      delete values.disable;
      setSaveing(true);
      screenStore!
        .updateLayer(screenStore!.currLayer.id, {
          anime: values
        })
        .then((rel) => {
          rel && Message.success('保存成功');
        })
        .finally(() => {
          setSaveing(false);
        });
    };

    const onPlay = () => {
      if (!screenStore!.currLayer) return;

      currAnime.current?.pause();
      currAnime.current?.seek(0);

      if (playing) {
        setPlaying(false);
        return;
      }

      form.validateFields().then((values) => {
        if (
          isEmpty(values.translateX) &&
          isEmpty(values.translateY) &&
          isEmpty(values.scale) &&
          isEmpty(values.rotate) &&
          isEmpty(values.opacity) &&
          isEmpty(values.width) &&
          isEmpty(values.height)
        ) {
          return;
        }

        const params: any = {};
        Object.keys(values).forEach((key) => {
          if (!isEmpty(values[key])) {
            params[key] = values[key];
          }
        });

        if (params.loop !== undefined && params.loop === 0) {
          params.loop = true;
        }

        currAnime.current = anime({
          ...params,
          targets: document.getElementById(screenStore!.currLayer!.id),
          begin: () => {
            setPlaying(true);
          },
          complete: () => {
            setPlaying(false);
          }
        });
      });
    };

    const initialValues: any = {};
    const layerAnime: any = screenStore!.currLayer?.anime;
    animeFields.forEach((v) => {
      initialValues[v.name] = layerAnime ? layerAnime[v.name] : v.default;
    });

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
          initialValues={initialValues}
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
                name="autoplay"
                label="自动播放"
                valuePropName="checked"
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
                initialValue={
                  layerAnime && !isEmpty(layerAnime.autoplay)
                    ? layerAnime.autoplay
                    : true
                }
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Button style={{ margin: '3px' }} onClick={onReset}>
            重置组件
          </Button>
          <Button
            type="primary"
            style={{ margin: '3px' }}
            onClick={onSave}
            loading={saveing}
          >
            保存
          </Button>
          <Button
            type="primary"
            style={{ margin: '3px' }}
            onClick={onPlay}
            icon={playing ? <StepForwardOutlined /> : <CaretRightOutlined />}
          >
            {playing ? '停止' : '播放'}
          </Button>
        </div>
      </div>
    );
  })
);

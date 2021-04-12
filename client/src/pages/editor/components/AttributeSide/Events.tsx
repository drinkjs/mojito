/* eslint-disable no-eval */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Select, Tooltip, Switch } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CodeEditor from 'components/CodeEditor';
import { ScreenStore } from 'types';
import { LayerEvent } from 'pages/editor/components/Layer';
import styles from './index.module.scss';
import { useUpdateEffect } from 'ahooks';

const { Option } = Select;

interface Props {
  screenStore?: ScreenStore;
}

const myConsole = {
  log: console.log
};

let myConsoleArgs: any[] = [];

const DEFAULT_CODE = [
  '//export function handler(){',
  '//\tconsole.log(this)',
  '//}'
].join('\n');

const systemEvent = [
  {
    label: '组件加载',
    value: LayerEvent.onLoad
  },
  {
    label: '组件显示',
    value: LayerEvent.onShow
  },
  {
    label: '组件销毁',
    value: LayerEvent.onUnload
  },
  {
    label: '数据源加载',
    value: LayerEvent.onDataSource
  },
  {
    label: '跨屏消息',
    value: LayerEvent.onSync
  }
];

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const currCodeRef = useRef<string>();
    const currLayerId = useRef<string>();
    const currEditor = useRef<any>();
    const [currEvent, setCurrEvent] = useState<string>();
    const [eventTips, setEventTips] = useState<string>();
    const [codeString, setCodeString] = useState<string>('');
    const [isSync, setIsSync] = useState(false);

    useEffect(() => {
      // 用于捕获编辑器内的console信息用于调式
      console.log = function () {
        // eslint-disable-next-line prefer-rest-params
        const args = Array.prototype.slice.call(arguments, 0);
        myConsole.log.apply(this, args);
        myConsoleArgs.push(args);
      };
      return () => {
        myConsoleArgs = [];
        console.log = myConsole.log;
      };
    }, []);

    useEffect(() => {
      if (
        screenStore!.currLayer &&
        currLayerId.current !== screenStore!.currLayer.id
      ) {
        setCurrEvent(undefined);
        setEventTips('');
        setIsSync(false);
        setCodeString('');
        currLayerId.current = screenStore!.currLayer.id;
      }
    }, [screenStore!.currLayer]);

    /**
     * 代码改变时保存代码
     */
    useUpdateEffect(() => {
      onSave();
    }, [codeString]);

    /**
     * 保存代码
     */
    const onSave = useCallback(() => {
      if (
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.id &&
        currEvent
      ) {
        screenStore.updateLayer(screenStore.currLayer.id, {
          events: {
            ...screenStore.currLayer.events,
            [currEvent]: {
              code: codeString === DEFAULT_CODE ? '' : codeString,
              isSync
            }
          }
        });
      }
    }, [currEvent, isSync, codeString]);

    /**
     * 选择事件
     */
    const onEventChange = useCallback((value) => {
      setCurrEvent(value);
      currCodeRef.current = '';
      if (
        value &&
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.events &&
        screenStore.currLayer.events[value]
      ) {
        setCodeString(screenStore.currLayer.events[value].code || '');
        currEditor.current.setValue(
          screenStore.currLayer.events[value].code || '',
          1
        );
        setIsSync(screenStore!.currLayer.events[value].isSync);
      } else {
        setCodeString(DEFAULT_CODE);
        currEditor.current.setValue(DEFAULT_CODE, 1);
        setIsSync(false);
      }

      if (
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.component &&
        screenStore.currLayer.component.events &&
        screenStore.currLayer.component.events[value]
      ) {
        setEventTips(screenStore!.currLayer.component.events[value].comment);
      } else {
        setEventTips('');
      }
    }, []);

    /**
     * 设置事件同步
     */
    const onSetSync = useCallback((checked) => {
      setIsSync(checked);
    }, []);

    /**
     * 输入代码
     */
    const onCodeChange = useCallback((value: string) => {
      setCodeString(value || '');
    }, []);

    /**
     * 代码编辑器初始成功
     * @param editor
     */
    const onEditorReady = (editor: any) => {
      currEditor.current = editor;
    };

    return (
      <div>
        <div className={styles.title}>
          <p>绑定事件</p>
          <Select
            placeholder="请选择事件"
            style={{ width: '100%' }}
            onChange={onEventChange}
            value={currEvent}
          >
            {systemEvent.map((v) => {
              return (
                <Option value={v.value} key={v.value}>
                  {v.label}
                </Option>
              );
            })}
            {screenStore &&
              screenStore.currLayer &&
              screenStore.currLayer.component &&
              screenStore.currLayer.component.events &&
              Object.keys(screenStore!.currLayer.component.events).map(
                (key) => {
                  const events: any = screenStore!.currLayer!.component.events;
                  return (
                    <Option value={key} key={key}>
                      {events[key].name || key}
                    </Option>
                  );
                }
              )}
          </Select>
        </div>

        <div className={styles.title}>
          <section
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '12px'
            }}
          >
            <div>
              事件处理
              {eventTips && (
                <Tooltip title={eventTips}>
                  <span style={{ color: '#666', marginLeft: '6px' }}>
                    <ExclamationCircleOutlined />
                  </span>
                </Tooltip>
              )}
              {currEvent &&
                systemEvent.map((v) => v.value).indexOf(currEvent) === -1 && (
                  <Switch
                    checkedChildren="同步"
                    unCheckedChildren="同步"
                    style={{ marginLeft: '6px' }}
                    onChange={onSetSync}
                    checked={isSync}
                  />
              )}
            </div>
          </section>
          <CodeEditor
            style={{ width: '100%', height: '600px' }}
            mode="javascript"
            // value={codeString}
            onChange={onCodeChange}
            onReady={onEditorReady}
          />
        </div>
      </div>
    );
  })
);

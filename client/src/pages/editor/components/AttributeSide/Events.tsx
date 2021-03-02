/* eslint-disable no-eval */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Select, Button, Tooltip, Switch } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CodeEditor from 'components/CodeEditor';
import { GlobalEventer } from 'common/eventer';
import { toJS } from 'mobx';
import anime from 'animejs';
import { ScreenStore } from 'types';
import { eventRequest, LayerEvent } from 'components/Layer';
import Message from 'components/Message';
import { buildCode } from 'common/util';
import styles from './index.module.scss';

const eventer = new GlobalEventer();
eventer.setMaxListeners(1024);
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
  }
];

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore } = props;
    const currCodeRef = useRef<string>();
    const currLayerId = useRef<string>();
    const currEditor = useRef<any>();
    const [currEvent, setCurrEvent] = useState<string>();
    const [consoleArgs, setConsoleArgs] = useState<any[]>([]);
    const [error, setError] = useState<Error>();
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
        eventer.removeAllListeners();
      };
    }, []);

    useEffect(() => {
      if (
        screenStore!.currLayer &&
        currLayerId.current !== screenStore!.currLayer.id
      ) {
        setCurrEvent(undefined);
        setConsoleArgs([]);
        setError(undefined);
        setEventTips('');
        setIsSync(false);
        setCodeString('');
        currLayerId.current = screenStore!.currLayer.id;
      }
    }, [screenStore!.currLayer]);

    /**
     * 主动保存代码
     */
    const onSave = useCallback(() => {
      if (
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.id &&
        currEvent
      ) {
        screenStore!
          .updateLayer(screenStore!.currLayer.id, {
            events: {
              ...screenStore!.currLayer.events,
              [currEvent]: { code: codeString, isSync }
            }
          })
          .then((rel) => {
            rel && Message.success('保存成功');
          });
      }
    }, [currEvent, isSync, codeString]);

    /**
     * 调式代码
     */
    const onDebug = useCallback(() => {
      myConsoleArgs = [];
      setError(undefined);

      try {
        const code = codeString;
        const fun = buildCode(code);
        if (fun) {
          fun.call(createThis());
          setConsoleArgs(myConsoleArgs);
        }
      } catch (e) {
        setError(e);
      }
    }, [codeString]);

    /**
     * 选择事件
     */
    const onEventChange = useCallback((value) => {
      setCurrEvent(value);
      setError(undefined);
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
     * 回调事件this
     */
    const createThis = () => {
      if (!screenStore || !screenStore.currLayer) {
        return {};
      }
      return {
        props: toJS(screenStore!.currLayer.props),
        style: toJS(screenStore!.currLayer.style),
        eventer,
        request: eventRequest,
        anime: (animeParams: anime.AnimeParams) => {
          return anime({
            ...animeParams,
            targets: document.getElementById(screenStore!.currLayer!.id)
          });
        },
        setProps: () => {},
        setStyles: () => {},
        layer: document.getElementById(screenStore!.currLayer.id)
      };
    };

    /**
     * 显示编辑内的console内容
     */
    const printDebug = () => {
      return consoleArgs.map((args) => {
        const formatArgs = args.map((v: any) => {
          return JSON.stringify(
            v && v.layer ? { ...v, layer: 'div@layer' } : v,
            null,
            2
          );
        });
        return <div key="printDebug">{formatArgs.join(',')}</div>;
      });
    };

    const onSetSync = useCallback((checked) => {
      setIsSync(checked);
    }, []);

    const onCodeChange = useCallback((value: string) => {
      setCodeString(value || '');
    }, []);

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
                  return (
                    <Option value={key} key={key}>
                      {key}
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
            {currEvent && (
              <div>
                <Button size="small" onClick={onDebug}>
                  调试
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={onSave}
                  style={{ marginLeft: '6px', minWidth: '32px' }}
                  loading={screenStore!.saveLoading}
                >
                  保存
                </Button>
              </div>
            )}
          </section>
          <CodeEditor
            style={{ width: '100%', height: '400px' }}
            mode="javascript"
            // value={codeString}
            onChange={onCodeChange}
            onReady={onEditorReady}
          />
        </div>

        {currEvent && (
          <div className={styles.title}>
            <section
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '12px'
              }}
            >
              调试信息{' '}
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setConsoleArgs([]);
                  setError(undefined);
                }}
                style={{ marginLeft: '6px' }}
              >
                清空
              </Button>
            </section>
            <div
              style={{
                background: '#1e1e1e',
                height: '150px',
                overflow: 'auto',
                padding: '3px'
              }}
            >
              {printDebug()}
              {error && (
                <div style={{ color: '#cc0000' }}>
                  Error：{JSON.stringify(error)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  })
);

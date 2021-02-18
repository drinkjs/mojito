/* eslint-disable no-eval */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { observer, inject } from 'mobx-react';
import { Select, Button, Tooltip, Switch, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
import Monaco from 'components/Monaco';
import { GlobalEventer } from 'common/eventer';
import { toJS } from 'mobx';
import { ScreenStore } from 'types';
import { eventRequest, LayerEvent } from 'components/Layer';
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
  '// 请不要使用export default方式导出',
  '// 可以通过this对象获取组件的style和props',
  '// 要使用this必需使用function方式定义事件处理',
  '// 可以通过返回值或者调用this.setValue方法修改style和props',
  '// 可以通过this.eventer进行组件通信，用法与EventEmitter一致',
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
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const currCodeRef = useRef<string>();
    const currLayerId = useRef<string>();
    const [currEvent, setCurrEvent] = useState<string>('');
    const [consoleArgs, setConsoleArgs] = useState<any[]>([]);
    const [debugerRel, setDebugerRel] = useState<any>();
    const [error, setError] = useState<Error>();
    const [eventTips, setEventTips] = useState<string>();
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
        editorRef.current = undefined;
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
        setCurrEvent('');
        setConsoleArgs([]);
        setDebugerRel(undefined);
        setError(undefined);
        setEventTips('');
        setIsSync(false);
        editorRef.current && editorRef.current.setValue('');
        currLayerId.current = screenStore!.currLayer.id;
      }
    }, [screenStore!.currLayer]);

    /**
     * 生成代码编辑器
     */
    const onEditorCreate = useCallback(
      (codeEditor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = codeEditor;
      },
      []
    );

    /**
     * 主动保存代码
     */
    const onSave = useCallback(() => {
      if (
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.id &&
        editorRef.current
      ) {
        const code = editorRef.current.getValue();
        currCodeRef.current = code;
        screenStore!
          .updateLayer(screenStore!.currLayer.id, {
            events: {
              ...screenStore!.currLayer.events,
              [currEvent]: { code, isSync }
            }
          })
          .then(() => {
            message.success({ content: '保存成功', key: 'saveEvent' });
          });
      }
    }, [currEvent, isSync]);

    /**
     * 调式代码
     */
    const onDebug = useCallback(() => {
      myConsoleArgs = [];
      setDebugerRel('');
      setError(undefined);

      try {
        const code = editorRef.current ? editorRef.current.getValue() : '';
        const fun = buildCode(code);
        if (fun) {
          const rel = fun.call(createThis());
          setDebugerRel(rel);
          setConsoleArgs(myConsoleArgs);
        }
      } catch (e) {
        setError(e);
      }
    }, []);

    /**
     * 选择事件
     */
    const onEventChange = useCallback((value) => {
      setCurrEvent(value);
      setDebugerRel('');
      setError(undefined);
      currCodeRef.current = '';
      if (
        value &&
        screenStore &&
        screenStore.currLayer &&
        screenStore.currLayer.events &&
        screenStore.currLayer.events[value]
      ) {
        editorRef.current &&
          editorRef.current.setValue(screenStore.currLayer.events[value].code);
        setIsSync(screenStore!.currLayer.events[value].isSync);
      } else {
        editorRef.current && editorRef.current.setValue(DEFAULT_CODE);
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
        setValue: () => {}
      };
    };

    /**
     * 显示编辑内的console内容
     */
    const printDebug = () => {
      return consoleArgs.map((args) => {
        const formatArgs = args.map((v: any) => JSON.stringify(v));
        return <div key="printDebug">{formatArgs.join(',')}</div>;
      });
    };

    const onSetSync = useCallback((checked) => {
      setIsSync(checked);
    }, []);

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
                  调式
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
          <Monaco
            style={{ width: '100%', height: '300px' }}
            // value={DEFAULT_CODE}
            onCreate={onEditorCreate}
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
                  setDebugerRel('');
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
                height: '100px',
                overflow: 'auto',
                padding: '3px'
              }}
            >
              {printDebug()}
              {debugerRel !== '' && (
                <div>返回值：{JSON.stringify(debugerRel)}</div>
              )}
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

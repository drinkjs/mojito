/* eslint-disable multiline-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Moveable from 'react-moveable';
import { observer, inject } from 'mobx-react';
import {
  MinusOutlined,
  PlusOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Tooltip, Switch } from 'antd';
import { runInAction, toJS } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { useDebounceFn, useInterval } from 'ahooks';
import {
  ContextMenu,
  MenuItem,
  connectMenu,
  ContextMenuTrigger
} from 'react-contextmenu';
import * as transformParser from 'transform-parser';
import IconFont, { IconLink } from 'components/IconFont';
import Layer from 'components/Layer';
import Eventer from 'common/eventer';
import './react-contextmenu.css';
import { ComponentStore, ComponentStyle, LayerInfo, ScreenStore } from 'types';
import {
  DefaulBackgroundColor,
  DefaultFontColor,
  DefaultLayerSize,
  saveTime
} from 'config';
import styles from './index.module.scss';
import { CHANGE_GROUP } from '../AttributeSide/GroupSet';
import Message from 'components/Message';
// import Message from 'components/Message';

let compCount: { [key: string]: number } = {};

const shortKeys = ['g', 'b', 'z', 'y', 'h', 'l', 's'];
const moveKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

interface Props {
  screenStore?: ScreenStore;
  componentStore?: ComponentStore;
}

interface FrameInfo {
  layerId: string;
  style: ComponentStyle;
}

const toolStyles = {
  margin: '0 6px'
};

// 右键菜单
const LayerContextMenu = (props: any) => {
  const { id, trigger } = props;
  const handleItemClick = trigger ? trigger.onItemClick : null;
  const layer: LayerInfo = trigger ? trigger.layer : null;

  return (
    <ContextMenu id={id} style={{ display: trigger ? 'block' : 'none' }}>
      {trigger ? (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <MenuItem
            onClick={handleItemClick}
            data={{ action: 'SET_TOP', layer }}
          >
            置顶
          </MenuItem>
          <MenuItem
            onClick={handleItemClick}
            data={{ action: 'SET_UP', layer }}
          >
            上移
          </MenuItem>
          <MenuItem
            onClick={handleItemClick}
            data={{ action: 'SET_DOWN', layer }}
          >
            下移
          </MenuItem>
          <MenuItem
            onClick={handleItemClick}
            data={{ action: 'SET_BOTTOM', layer }}
          >
            置底
          </MenuItem>
          {/* <MenuItem onClick={handleItemClick} data={{ action: "EDIT", layer }}>
            编辑
          </MenuItem> */}
          <MenuItem
            onClick={handleItemClick}
            data={{ action: 'REMOVE', layer }}
          >
            删除
          </MenuItem>
        </div>
      ) : (
        <div />
      )}
    </ContextMenu>
  );
};

const MENU_TYPE = 'LAYER_CONTEXT_MENU';
const ConnectedMenu = connectMenu(MENU_TYPE)(LayerContextMenu);

export default inject('screenStore')(
  observer(({ screenStore }: Props) => {
    const ref = useRef<HTMLDivElement>();
    const areaRef = useRef<HTMLDivElement>();
    const zoomRef = useRef<HTMLDivElement>();
    const moveableRef = useRef<Moveable>();
    const currNativeEvent = useRef<any>();
    const currLayerIds = useRef<Set<string>>(new Set()); // 选中的图层id
    const [saveing, setSaveing] = useState(false);

    const pageLayout = screenStore!.screenInfo
      ? screenStore!.screenInfo.style
      : undefined;
    const [scale, setScale] = useState<number>(1);
    const [oldSize, setOldSize] = useState<{ width: number; height: number }>({
      width: 0,
      height: 0
    });

    const [layerFrame, setLayerFrame] = useState<FrameInfo>(); // 单个图层位置信息
    const [groupframes, setGroupFrames] = useState<FrameInfo[]>([]); // 图层组位置信息
    const [groupElement, setGroupElement] = useState<HTMLElement[]>([]); // 图层组dom

    /**
     * 定时保存图层信息
     */
    useInterval(() => {
      screenStore?.saveScreen();
    }, saveTime);

    /**
     * 接受组件拖入
     */
    const [, dropTarget] = useDrop({
      accept: 'ADD_COMPONENT',
      drop: (item: any, monitor) => {
        const { value } = item;
        let x = 0;
        let y = 0;

        // 计算放下的位置
        const offset = monitor.getClientOffset();
        if (offset && ref.current) {
          const dropTargetXy = ref.current.getBoundingClientRect();
          x = (offset.x - dropTargetXy.left) / scale;
          y = (offset.y - dropTargetXy.top) / scale;
        }

        if (!compCount[value.libName]) {
          compCount[value.libName] = 1;
        } else {
          compCount[value.libName] += 1;
        }

        const z =
          screenStore!.layers && screenStore!.layers.length
            ? screenStore!.layers[0].style.z + 1
            : 1;

        // 防止出现无限位小数
        x = Math.round(x - DefaultLayerSize.width / 2);
        y = Math.round(y - DefaultLayerSize.height / 2);
        // 新图层
        if (screenStore && screenStore.screenInfo) {
          const newLayer: LayerInfo = {
            name: `${value.title}${compCount[value.libName]}`,
            component: value,
            initSize: false,
            style: {
              x,
              y,
              z,
              width: DefaultLayerSize.width,
              height: DefaultLayerSize.height
            },
            id: uuidv4()
          };

          screenStore.addLayer(newLayer);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      })
    });

    useEffect(() => {
      dropTarget(ref);
      window.addEventListener('keydown', onKeyDown);
      return () => {
        debounceChange.cancel();
        Eventer.remove(CHANGE_GROUP);
        window.removeEventListener('keydown', onKeyDown);
      };
    }, []);

    // 更新样式节流
    const debounceChange = useDebounceFn((type: string, value: any) => {
      if (screenStore && screenStore.currLayer && screenStore.currLayer.id) {
        screenStore.updateLayer(
          screenStore.currLayer.id,
          {
            style: { ...screenStore.currLayer.style, [type]: value }
          },
          { reload: true }
        );
      }
    });

    /**
     * 页面设置修改
     */
    useEffect(() => {
      onZoomReset(false);
    }, [pageLayout]);

    /**
     * 更新moveable
     */
    useEffect(() => {
      onResize();
    }, [screenStore!.currLayer]);

    useEffect(() => {
      moveableRef.current?.updateTarget();
    }, [groupElement]);

    /**
     * 拖动开始
     */
    useEffect(() => {
      if (
        groupElement.length > 0 &&
        currNativeEvent.current &&
        moveableRef.current
      ) {
        moveableRef.current.dragStart(currNativeEvent.current);
        currNativeEvent.current = null;
      }

      if (groupElement.length > 1) {
        // 右侧边栏改变群组位置
        Eventer.on(CHANGE_GROUP, onChangeGroup);
      }
      return () => {
        Eventer.remove(CHANGE_GROUP);
      };
    }, [groupElement, groupframes, currNativeEvent]);

    /**
     * 选中的图层
     */
    useEffect(() => {
      currLayerIds.current = toJS(screenStore!.selectedLayerIds);

      if (currLayerIds.current.size === 0) {
        setGroupElement([]);
        setGroupFrames([]);
        screenStore!.setCurrLayer(undefined);
      } else {
        const layerGroups = screenStore!.layerGroup;

        setGroupElement(
          layerGroups.map((v) => document.getElementById(v.id) as any)
        );
        setGroupFrames([]);

        if (currLayerIds.current.size > 1) {
          screenStore!.setCurrLayer(undefined);
          // 判断是否选中的图层是在同一个群组，主要用于右上角图标显示状态
          const groupSet = new Set<string>();
          layerGroups.forEach((v, index) => {
            groupSet.add(v.group || `${index}`);
          });
          setGroupFrames(
            layerGroups.map((layer) => {
              return {
                layerId: layer.id,
                style: { ...layer.style }
              };
            })
          );
        } else {
          // 只选中了一个图层
          if (layerGroups.length === 0) {
            setLayerFrame(undefined);
            screenStore!.setCurrLayer(undefined);
          } else {
            setLayerFrame({
              layerId: layerGroups[0].id,
              style: toJS(layerGroups[0].style)
            });
            screenStore!.setCurrLayer(layerGroups[0]);
          }
        }
      }
    }, [screenStore!.selectedLayerIds]);

    /**
     * 通过右边栏修改组大小
     */
    const onChangeGroup = useCallback(
      ({
        // x,
        // y,
        // width,
        // height,
        offsetX,
        offsetY,
        offsetWidth,
        offsetHeight
      }) => {
        groupframes.forEach((frame, index) => {
          const { style } = frame;
          if (!style || !style.width || !style.height) return;
          const target = groupElement[index];
          style.width = Math.round(style.width * offsetWidth);
          style.height = Math.round(style.height * offsetHeight);
          style.x += offsetX;
          style.y += offsetY;

          const transformObj = transformParser.parse(target.style.transform);
          transformObj.translateX = frame.style.x;
          transformObj.translateY = frame.style.y;

          target.style.transform = transformParser.stringify(transformObj);
          target.style.width = `${style.width}px`;
          target.style.height = `${style.height}px`;
        });
        saveGroup();
      },
      [groupframes, groupElement]
    );

    /**
     * 保存组信息
     */
    const saveGroup = () => {
      // 更新
      screenStore!.batchUpdateLayer(
        groupframes.map((frame) => {
          return {
            id: frame.layerId,
            style: frame.style
          };
        })
      );
      onResize();
    };

    /**
     * 更新moveable
     */
    const onResize = () => {
      if (moveableRef.current) moveableRef.current.updateRect();
    };

    /**
     * 缩放编辑区域
     * @param isAdd
     */
    const onZoom = (isAdd: boolean) => {
      if ((!isAdd && scale <= 0.1) || (isAdd && scale >= 2)) return;
      let scaleInt = 0;
      if (isAdd) {
        scaleInt = Math.floor(scale * 10) + 1;
      } else {
        scaleInt = Math.ceil(scale * 10) - 1;
      }

      scaleInt = parseFloat((scaleInt / 10).toFixed(2));
      if (ref.current && zoomRef.current && pageLayout) {
        ref.current.style.transform = `scale(${scaleInt})`;
        ref.current.style.transformOrigin = '0 0 0';
        zoomRef.current.style.width = `${pageLayout.width * scaleInt}px`;
        zoomRef.current.style.height = `${pageLayout.height * scaleInt}px`;
        setScale(scaleInt);
      }
    };

    /**
     * 自适应大小
     */
    const onZoomReset = (flag: boolean) => {
      if (
        !pageLayout ||
        (oldSize.width === pageLayout.width &&
          oldSize.height === pageLayout.height &&
          !flag)
      ) {
        return;
      }
      setOldSize({
        width: pageLayout.width,
        height: pageLayout.height
      });
      if (areaRef.current && ref.current && zoomRef.current) {
        const { width } = areaRef.current.getBoundingClientRect();
        const zoom = parseFloat((width / pageLayout.width).toFixed(2));
        ref.current.style.transform = `scale(${zoom})`;
        ref.current.style.transformOrigin = '0 0 0';
        zoomRef.current.style.width = `${pageLayout.width * zoom}px`;
        zoomRef.current.style.height = `${pageLayout.height * zoom}px`;
        setScale(zoom);
      }
    };

    const undo = () => {
      screenStore!.undo();
    };

    const redo = () => {
      screenStore!.redo();
    };

    /**
     * 键盘事件
     */
    const onKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.ctrlKey && shortKeys.indexOf(e.key) >= 0) {
        e.preventDefault();
      }

      if (screenStore?.currLayer && moveKeys.indexOf(e.key) >= 0) {
        e.preventDefault();
        const { style } = screenStore.currLayer;
        let type = '';
        let value: number = 0;
        switch (e.key) {
          case 'ArrowUp':
            type = 'y';
            style.y -= 1;
            value = style.y;
            break;
          case 'ArrowDown':
            type = 'y';
            style.y += 1;
            value = style.y;
            break;
          case 'ArrowLeft':
            type = 'x';
            style.x -= 1;
            value = style.x;
            break;
          case 'ArrowRight':
            type = 'x';
            style.x += 1;
            value = style.x;
            break;
        }

        // 当前图层的dom对象
        const currTarget = document.getElementById(screenStore.currLayer.id);
        if (type === '' || !currTarget) return;

        const transformObj = transformParser.parse(currTarget.style.transform);
        // 修改样式
        transformObj.translateX = style.x;
        transformObj.translateY = style.y;
        currTarget.style.transform = transformParser.stringify(transformObj);
        // 更新moveable
        moveableRef.current?.updateTarget();
        // 保存
        debounceChange.run(type, value);
        return;
      }

      if (e.key === 'Delete' && screenStore!.currLayer) {
        // 删除图层
        return screenStore!.confirmDeleteLayer(screenStore!.currLayer);
      }
      // esc取消选中
      if (e.key === 'Escape') {
        screenStore!.selectedLayerIds = new Set();
        return;
      }

      if (e.ctrlKey) {
        // 显示/隐藏
        if (e.key === 'h' && screenStore?.currLayer) {
          screenStore?.hideLayer(!screenStore!.isLayerHide);
        }
        // 锁定/解锁
        if (e.key === 'l' && screenStore?.currLayer) {
          screenStore?.lockLayer(!screenStore?.isLayerLock);
        }

        if (e.key === 'z') {
          return undo();
        }

        if (e.key === 'y') {
          return redo();
        }
        // 群组
        if (e.key === 'g' && currLayerIds.current.size > 1) {
          return groupLayer();
        }

        // 解除群组
        if (e.key === 'b' && currLayerIds.current.size > 1) {
          return disbandLayer();
        }

        // 保存
        if (e.key === 's') {
          return saveScreen();
        }
      }
    };

    /**
     * 保存
     */
    const saveScreen = () => {
      setSaveing(true);
      screenStore
        ?.saveScreen()
        .then((rel) => {
          if (rel) Message.success('保存成功');
        })
        .finally(() => {
          setSaveing(false);
        });
    };

    /**
     * 群组
     */
    const groupLayer = () => {
      if (currLayerIds.current.size === 0 || screenStore!.isSelectedGroup) {
        return;
      }
      screenStore!.groupLayer(Array.from(currLayerIds.current));
    };

    /**
     * 解组
     */
    const disbandLayer = () => {
      if (currLayerIds.current.size === 0 || !screenStore!.isSelectedGroup) {
        return;
      }
      screenStore!.disbandLayer(Array.from(currLayerIds.current));
    };

    /**
     * 当前选中的图层
     */
    const onSelectLayer = useCallback(
      (
        layerData: LayerInfo,
        event?: React.MouseEvent<HTMLDivElement, MouseEvent>
      ) => {
        if (screenStore!.selectedLayerIds.has(layerData.id)) return;

        currNativeEvent.current = event ? event.nativeEvent : null;

        const ids = toJS(screenStore!.selectedLayerIds);
        if (!event || !event.ctrlKey) {
          ids.clear();
        }

        let currGroupLayers = [layerData];
        if (layerData.group && screenStore!.layers) {
          // 找出所有同组图层
          currGroupLayers = screenStore!.layers.filter(
            (v) => v.group === layerData.group
          );
        }

        // 当前点击的图层及与之群组的图层
        currGroupLayers.forEach((v) => {
          ids.add(v.id);
        });

        runInAction(() => {
          screenStore!.selectedLayerIds = ids;
        });
      },
      []
    );

    /**
     * 第一次生成组件
     */
    const onLayerInit = useCallback((layer: LayerInfo) => {
      if (screenStore!.currLayer && screenStore!.currLayer.id === layer.id) {
        onSelectLayer(layer);
        onResize();
      }
    }, []);

    /**
     * 点击空白取消选中
     */
    const onEmptyClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (!screenStore!.resizeing) {
          screenStore!.setCurrLayer(undefined);
          runInAction(() => {
            screenStore!.selectedLayerIds = new Set();
          });
        }
      },
      []
    );

    /**
     * 处理右键菜单事件
     */
    const onContentMenuClick = useCallback((e, data) => {
      e.stopPropagation();
      if (!data || !screenStore || !screenStore.layers) return;

      const screenLayers = toJS(screenStore.layers);
      const layer: LayerInfo | undefined = screenLayers.find(
        (v) => v.id === data.layer.id
      );
      if (!layer) return;

      switch (data.action) {
        case 'REMOVE':
          screenStore.confirmDeleteLayer(data.layer);
          break;
        case 'SET_TOP': {
          const topZ = screenLayers[0].style.z;
          if (screenLayers[0].id !== layer.id) {
            layer.style.z = topZ + 1;
            screenStore.batchUpdateLayer(
              screenLayers.map((v) => ({ id: v.id, style: v.style }))
            );
          }
          break;
        }
        case 'SET_BOTTOM': {
          const bottomZ = screenLayers[screenLayers.length - 1].style.z;
          if (screenLayers[screenLayers.length - 1].id !== layer.id) {
            layer.style.z = bottomZ - 1;
            screenStore.batchUpdateLayer(
              screenLayers.map((v) => ({ id: v.id, style: v.style }))
            );
          }
          break;
        }
        case 'SET_UP': {
          const index = screenLayers.findIndex((v) => v.id === layer.id);
          if (index <= 0) return;
          const upLayer = screenLayers[index - 1];
          const upZ = upLayer.style.z;
          upLayer.style.z = layer.style.z;
          layer.style.z = upZ;
          screenStore.batchUpdateLayer(
            screenLayers.map((v) => ({ id: v.id, style: v.style }))
          );
          break;
        }
        case 'SET_DOWN': {
          const downIndex = screenLayers.findIndex((v) => v.id === layer.id);
          if (downIndex < 0 || downIndex === screenLayers.length - 1) return;
          const downLayer = screenLayers[downIndex + 1];
          const downZ = downLayer.style.z;
          downLayer.style.z = layer.style.z;
          layer.style.z = downZ;
          console.log(screenLayers.map((v) => ({ id: v.id, style: v.style })));
          screenStore.batchUpdateLayer(
            screenLayers.map((v) => ({ id: v.id, style: v.style }))
          );
          break;
        }
        // case "EDIT":
        //   onSelectLayer(layer);
        //   break;
        // default:
      }
    }, []);

    const screenLayers = screenStore!.layers;
    // 计算辅助线
    const verLines = [0];
    const horLines = [0];
    if (pageLayout && screenLayers) {
      verLines.push(pageLayout.width);
      horLines.push(pageLayout.height);
      screenLayers.forEach((layer) => {
        verLines.push(layer.style.x, layer.style.x + layer.style.width);
        horLines.push(layer.style.y, layer.style.y + layer.style.height);
      });
    }

    compCount = {};

    return (
      <>
        <aside className={styles.actionBar}>
          <div className={styles.zoomBox}>
            <div
              onClick={() => {
                onZoom(false);
              }}
              className={styles.zoomBtn}
            >
              <MinusOutlined />
            </div>
            <Tooltip placement="bottom" title="自适应">
              <div
                onClick={() => onZoomReset(true)}
                style={{ width: '50px' }}
                className={styles.zoomBtn}
              >
                {(scale * 100).toFixed(0)}%
              </div>
            </Tooltip>
            <div
              onClick={() => {
                onZoom(true);
              }}
              className={styles.zoomBtn}
            >
              <PlusOutlined />
            </div>
          </div>
          {screenStore!.screenInfo && (
            <div className={styles.toolbar}>
              <span style={{ ...toolStyles, fontSize: '12px' }}>
                事件锁定
                <Switch
                  size="small"
                  style={toolStyles}
                  checked={
                    screenStore!.currLayer && screenStore!.currLayer.eventLock
                  }
                  onChange={(checked) => {
                    screenStore!.currLayer &&
                      screenStore!.updateLayer(screenStore!.currLayer.id, {
                        eventLock: checked
                      });
                  }}
                  disabled={!screenStore!.currLayer}
                />
              </span>

              {saveing ? (
                <LoadingOutlined style={toolStyles} />
              ) : (
                <IconLink
                  icon="icon-baocun"
                  style={toolStyles}
                  onClick={() => {
                    saveScreen();
                  }}
                  title="保存(Ctrl+S)"
                />
              )}
              <IconLink
                icon="icon-shuaxin1"
                style={toolStyles}
                onClick={() => {
                  screenStore!.reloadLayer();
                }}
                title="刷新组件"
                disabled={screenStore!.selectedLayerIds.size !== 1}
              />
              <IconLink
                icon="icon-suoding"
                className={
                  screenStore?.isLayerLock ? undefined : styles.noLockHide
                }
                style={toolStyles}
                disabled={screenStore!.selectedLayerIds.size === 0}
                title={
                  screenStore!.isLayerLock
                    ? '解锁组件(Ctrl+L)'
                    : '锁定组件(Ctrl+L)'
                }
                onClick={() => {
                  screenStore?.lockLayer(!screenStore!.isLayerLock);
                }}
              />
              <IconLink
                icon="icon-xianshi1"
                className={
                  screenStore?.isLayerHide ? styles.noLockHide : undefined
                }
                style={toolStyles}
                disabled={screenStore!.selectedLayerIds.size === 0}
                onClick={() => {
                  screenStore?.hideLayer(!screenStore!.isLayerHide);
                }}
                title={
                  screenStore?.isLayerHide
                    ? '显示组件(Ctrl+H)'
                    : '隐藏组件(Ctrl+H)'
                }
              />
              <IconLink
                title="群组(Ctrl+G)"
                icon="icon-hebing"
                onClick={groupLayer}
                disabled={
                  screenStore!.isSelectedGroup ||
                  screenStore!.selectedLayerIds.size < 2
                }
                style={toolStyles}
              />
              <IconLink
                title="解组(Ctrl+B)"
                icon="icon-shoudongfenli"
                onClick={disbandLayer}
                disabled={
                  !screenStore?.isSelectedGroup ||
                  screenStore?.layerGroup.length < 2
                }
                style={toolStyles}
              />
              <IconLink
                title="撤销(Ctrl+Z)"
                icon="icon-zhongzuo1"
                onClick={undo}
                disabled={screenStore!.undoData.length === 0}
                style={toolStyles}
              />
              <IconLink
                title="重做(Ctrl+Y)"
                icon="icon-zhongzuo"
                onClick={redo}
                disabled={screenStore!.redoData.length === 0}
                style={toolStyles}
              />
              <Tooltip placement="bottom" title="预览">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href={`/screen/${screenStore!.screenInfo.id}`}
                  className={styles.preview}
                >
                  <IconFont type="icon-chakan" />
                </a>
              </Tooltip>
            </div>
          )}
        </aside>
        <section className={styles.root} onMouseDown={onEmptyClick}>
          <div
            className={styles.area}
            ref={(ref) => {
              areaRef.current = ref || undefined;
            }}
          >
            <div
              ref={(ref) => {
                zoomRef.current = ref || undefined;
              }}
              style={{ margin: 'auto' }}
            >
              {pageLayout && (
                <div
                  style={{
                    ...pageLayout,
                    backgroundColor:
                      pageLayout.backgroundColor || DefaulBackgroundColor,
                    backgroundImage: pageLayout.backgroundImage
                      ? `url(${pageLayout.backgroundImage})`
                      : 'none',
                    color: pageLayout.color || DefaultFontColor,
                    backgroundSize:
                      pageLayout.backgroundRepeat === 'no-repeat'
                        ? '100% 100%'
                        : undefined,
                    backgroundRepeat: pageLayout.backgroundRepeat,
                    position: 'relative',
                    boxShadow: '3px 3px 15px rgb(0 0 0 / 15%)'
                  }}
                  ref={(r) => {
                    ref.current = r || undefined;
                  }}
                >
                  {screenLayers &&
                    screenLayers.map((v) => {
                      if (!v.component) return null;

                      if (!compCount[v.component.libName]) {
                        compCount[v.component.libName] = 1;
                      } else {
                        compCount[v.component.libName] += 1;
                      }
                      const layerData = toJS(v);
                      return (
                        <ContextMenuTrigger
                          id={MENU_TYPE}
                          holdToDisplay={-1}
                          collect={(data) => {
                            return {
                              ...data,
                              layer: layerData,
                              onItemClick: onContentMenuClick
                            };
                          }}
                          disableIfShiftIsPressed
                          key={v.id}
                        >
                          <Layer
                            enable
                            defaultWidth={DefaultLayerSize.width}
                            defaultHeight={DefaultLayerSize.height}
                            data={layerData}
                            key={`${layerData.id}_${layerData.reloadKey}`}
                            onSelected={onSelectLayer}
                            onReady={onLayerInit}
                          />
                        </ContextMenuTrigger>
                      );
                    })}
                  <Moveable
                    snappable
                    verticalGuidelines={verLines}
                    horizontalGuidelines={horLines}
                    ref={(ref) => {
                      moveableRef.current = ref || undefined;
                    }}
                    target={groupElement}
                    draggable={!screenStore!.isLayerLock}
                    resizable={!screenStore!.isLayerLock}
                    onDragGroupStart={({ events }) => {
                      screenStore!.setResizeing(true);
                      events.forEach((ev, i) => {
                        const frame = groupframes[i];
                        ev.set([frame.style.x, frame.style.y]);
                      });
                    }}
                    onDragGroup={({ events }) => {
                      events.forEach(({ target, beforeTranslate }, i) => {
                        const frame = groupframes[i];
                        frame.style.x = Math.round(beforeTranslate[0]);
                        frame.style.y = Math.round(beforeTranslate[1]);

                        const transformObj = transformParser.parse(
                          target.style.transform
                        );
                        transformObj.translateX = frame.style.x;
                        transformObj.translateY = frame.style.y;

                        target.style.transform = transformParser.stringify(
                          transformObj
                        );
                      });
                    }}
                    onDragGroupEnd={({ isDrag }) => {
                      currNativeEvent.current = null;
                      screenStore!.setResizeing(false);
                      if (!isDrag) return;
                      saveGroup();
                    }}
                    onResizeGroupStart={({ events }) => {
                      screenStore!.setResizeing(true);
                      events.forEach((ev, i) => {
                        const frame = groupframes[i];
                        // Set origin if transform-orgin use %.
                        ev.setOrigin(['%', '%']);
                        // If cssSize and offsetSize are different, set cssSize.
                        const style = window.getComputedStyle(ev.target);
                        const cssWidth = parseFloat(style.width);
                        const cssHeight = parseFloat(style.height);
                        ev.set([cssWidth, cssHeight]);
                        // If a drag event has already occurred, there is no dragStart.
                        if (ev.dragStart) {
                          ev.dragStart.set([frame.style.x, frame.style.y]);
                        }
                      });
                    }}
                    onResizeGroup={({ events }) => {
                      events.forEach(({ target, width, height, drag }, i) => {
                        const frame = groupframes[i];
                        target.style.overflow = 'hidden';
                        frame.style.width = Math.round(width);
                        frame.style.height = Math.round(height);
                        frame.style.x = Math.round(drag.beforeTranslate[0]);
                        frame.style.y = Math.round(drag.beforeTranslate[1]);

                        const transformObj = transformParser.parse(
                          target.style.transform
                        );
                        transformObj.translateX = frame.style.x;
                        transformObj.translateY = frame.style.y;

                        target.style.transform = transformParser.stringify(
                          transformObj
                        );
                        target.style.width = `${width}px`;
                        target.style.height = `${height}px`;
                      });
                    }}
                    onResizeGroupEnd={({ isDrag, targets }) => {
                      targets.forEach((target) => {
                        target.style.overflow = 'visible';
                      });
                      screenStore!.setResizeing(false);
                      if (!isDrag) return;
                      saveGroup();
                    }}
                    onDragStart={({ set }) => {
                      set([layerFrame!.style.x, layerFrame!.style.y]);
                    }}
                    onDrag={({ target, beforeTranslate }) => {
                      if (!layerFrame) return;
                      layerFrame.style.x = Math.round(beforeTranslate[0]);
                      layerFrame.style.y = Math.round(beforeTranslate[1]);

                      const transformObj = transformParser.parse(
                        target.style.transform
                      );
                      transformObj.translateX = layerFrame.style.x;
                      transformObj.translateY = layerFrame.style.y;

                      target.style.transform = transformParser.stringify(
                        transformObj
                      );
                    }}
                    onDragEnd={({ lastEvent }) => {
                      currNativeEvent.current = null;
                      if (lastEvent && layerFrame) {
                        screenStore!.updateLayer(layerFrame.layerId, {
                          style: {
                            ...screenStore!.currLayer!.style,
                            ...layerFrame.style
                          }
                        });
                      }
                    }}
                    onResizeStart={({ setOrigin, dragStart }) => {
                      setOrigin(['%', '%']);
                      screenStore!.setResizeing(true);
                      if (dragStart && layerFrame) {
                        dragStart.set([layerFrame.style.x, layerFrame.style.y]);
                      }
                    }}
                    onResize={({ target, width, height, drag }) => {
                      if (!layerFrame) return;
                      const { beforeTranslate } = drag;
                      layerFrame.style.x = Math.round(beforeTranslate[0]);
                      layerFrame.style.y = Math.round(beforeTranslate[1]);
                      layerFrame.style.width = Math.round(width);
                      layerFrame.style.height = Math.round(height);
                      target.style.width = `${layerFrame.style.width}px`;
                      target.style.height = `${layerFrame.style.height}px`;

                      const transformObj = transformParser.parse(
                        target.style.transform
                      );
                      transformObj.translateX = layerFrame.style.x;
                      transformObj.translateY = layerFrame.style.y;

                      target.style.transform = transformParser.stringify(
                        transformObj
                      );
                    }}
                    onResizeEnd={({ lastEvent }) => {
                      if (lastEvent && layerFrame) {
                        const { drag } = lastEvent;
                        layerFrame.style.x = Math.round(
                          drag.beforeTranslate[0]
                        );
                        layerFrame.style.y = Math.round(
                          drag.beforeTranslate[1]
                        );
                        layerFrame.style.width = Math.round(lastEvent.width);
                        layerFrame.style.height = Math.round(lastEvent.height);
                        // 更新图层
                        screenStore!.updateLayer(layerFrame.layerId, {
                          style: {
                            ...screenStore!.currLayer!.style,
                            ...layerFrame.style
                          }
                        });
                      }
                      screenStore!.setResizeing(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <ConnectedMenu />
        </section>
      </>
    );
  })
);

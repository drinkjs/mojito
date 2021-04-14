import React, { useCallback, useState, useEffect } from 'react';
import { Tooltip, Row, Col, Skeleton, Popover, Empty } from 'antd';
import { CloseOutlined, RollbackOutlined } from '@ant-design/icons';
import IconFont from 'components/IconFont';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { ComponentInfo, ComponentStore, ComponentTypeTree } from 'types';
import Item from './Item';
import AddComponent from './AddComponent';
import ComponentTypeList from './ComponentTypeList';
import styles from './index.module.scss';

const classNames = require('classnames');

interface Props {
  componentStore?: ComponentStore;
}

export default inject('componentStore')(
  observer((props: Props) => {
    const { componentStore } = props;
    const [currCategory, setCurrCategory] = useState<ComponentTypeTree[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showList, setShowList] = useState(false);
    const [editCompoent, setEditComponent] = useState<ComponentInfo>();
    const [currRoot, setCurrRoot] = useState<ComponentTypeTree>();

    useEffect(() => {
      componentStore!.getTypeTree();
    }, []);

    const onCateClick = useCallback(
      (category: ComponentTypeTree, isRoot: boolean) => {
        if (isRoot) {
          setCurrCategory([category]);
          setCurrRoot(category);
        } else {
          setCurrCategory(currCategory.concat(category));
        }

        // if (!category.children) {
        // 最后一层请求组件
        componentStore!.getTypeComponent(category.id);
        // }
      },
      [currCategory]
    );

    const onClose = useCallback(
      (/* e: React.MouseEvent<any> */) => {
        const cates = currCategory.slice(0, -1);
        setCurrCategory(cates);
        if (cates.length === 0) {
          setCurrRoot(undefined);
        } else {
          componentStore!.getTypeComponent(cates[cates.length - 1].id);
        }
      },
      [currCategory]
    );

    const onCancel = useCallback(() => {
      setShowAdd(false);
      setEditComponent(undefined);
    }, []);

    const onEditComponent = useCallback((comp: ComponentInfo) => {
      setEditComponent(toJS(comp));
      setShowAdd(true);
    }, []);

    const onRemoveComponent = useCallback((comp: ComponentInfo) => {
      if (!comp.id) {
        return;
      }
      componentStore!.removeComponent(comp.id).then(() => {
        componentStore!.getTypeComponent(comp.type);
      });
    }, []);

    const currType =
      currCategory.length > 0 ? currCategory[currCategory.length - 1] : null;

    /**
     * 显示组件
     */
    const showComponents = () => {
      return (
        <>
          {componentStore!.typeComponent &&
          componentStore!.typeComponent.length > 0
            ? componentStore!.typeComponent.map((comp: ComponentInfo) => {
              return (
                  <Col span={12} key={comp.id} style={{ padding: '6px' }}>
                    <Item
                      value={comp}
                      onEdit={onEditComponent}
                      onRemove={onRemoveComponent}
                    />
                  </Col>
              );
            })
            : (!currType ||
                !currType.children ||
                currType.children.length === 0) && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无组件"
                  />
                </div>
              )}
        </>
      );
    };

    /**
     * 显示二级类型
     */
    const showChildrenType = () => {
      return (
        <Row className={styles.componentBox} key="types">
          {currType &&
            currType.children &&
            currType.children.map((v) => {
              return (
                <Col span={24} key={v.id} style={{ padding: '0px 10px' }}>
                  <div
                    className={styles.componentView}
                    onClick={() => {
                      onCateClick(v, false);
                    }}
                  >
                    <div className={styles.componentImg}>
                      <IconFont
                        type={v.icon || 'icon-tupian'}
                        style={{ fontSize: '48px' }}
                      />
                    </div>
                    <div className={styles.componentTitle}>{v.name}</div>
                  </div>
                </Col>
              );
            })}
          {showComponents()}
        </Row>
      );
    };

    return (
      <section className={styles.bar}>
        <div className={styles.category}>
          <div key="上传组件">
            <Tooltip placement="right" title="上传组件">
              <div
                className={styles.icon}
                onClick={() => {
                  setShowAdd(true);
                }}
              >
                <IconFont type="icon-upload" style={{ color: '#FFF' }} />
              </div>
            </Tooltip>
          </div>
          <div key="分类管理">
            <Tooltip placement="right" title="分类管理">
              <Popover
                placement="rightTop"
                title="分类管理"
                content={<ComponentTypeList />}
                trigger="click"
                arrowPointAtCenter
                onVisibleChange={(visible) => {
                  setCurrRoot(undefined);
                  setCurrCategory([]);
                  setShowList(visible);
                }}
              >
                <div
                  className={classNames(styles.icon, {
                    [styles.iconSelected]: showList
                  })}
                >
                  <IconFont
                    type="icon-shezhi"
                    style={{ color: showList ? '#000' : '#FFF' }}
                  />
                </div>
              </Popover>
            </Tooltip>
          </div>
          {componentStore!.typeTree.map((v) => {
            return (
              <Tooltip placement="right" title={v.name} key={v.name}>
                <div
                  className={classNames(styles.icon, {
                    [styles.iconSelected]: currRoot && currRoot.id === v.id
                  })}
                  onClick={() => {
                    onCateClick(v, true);
                  }}
                >
                  <IconFont type={v.icon || ''} />
                </div>
              </Tooltip>
            );
          })}
        </div>
        {currType && (
          <div className={styles.components}>
            <div className={styles.cateTitle}>
              {currType.name}
              <span className={styles.close} onClick={onClose}>
                {currCategory.length > 1
                  ? (
                  <RollbackOutlined />
                    )
                  : (
                  <CloseOutlined />
                    )}
              </span>
            </div>
            <Skeleton loading={componentStore!.getTypeTreeLoading}>
              {showChildrenType()}
              {/* {showComponents()} */}
            </Skeleton>
          </div>
        )}
        <AddComponent
          visible={showAdd}
          onCancel={onCancel}
          value={editCompoent}
        />
      </section>
    );
  })
);

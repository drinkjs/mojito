import React, { useCallback, useState, useEffect } from 'react';
import { Tooltip, Row, Col, Skeleton } from 'antd';
import { CloseOutlined, RollbackOutlined } from '@ant-design/icons';
import IconFont from 'components/IconFont';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { ComponentInfo, ComponentStore, ComponentTypeTree } from 'types';
import Item from './Item';
import AddComponent from './AddComponent';
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

        if (!category.children) {
          // 最后一层请求组件
          componentStore!.getTypeComponent(category.id);
        }
      },
      [currCategory]
    );

    const onClose = useCallback(
      (/* e: React.MouseEvent<any> */) => {
        setCurrCategory(currCategory.slice(0, -1));
      },
      [currCategory]
    );

    const onShow = useCallback(() => {
      setShowAdd(true);
    }, []);

    const onCancel = useCallback(() => {
      setShowAdd(false);
      setEditComponent(undefined);
    }, []);

    const onEditComponent = useCallback((comp: ComponentInfo) => {
      setEditComponent(toJS(comp));
      setShowAdd(true);
    }, []);

    const onRemoveComponent = useCallback((comp: ComponentInfo) => {
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
        <Row className={styles.componentBox} key="components">
          {componentStore!.typeComponent &&
            componentStore!.typeComponent.map((comp: ComponentInfo) => {
              return (
                <Col span={24} key={comp.id} style={{ padding: '6px' }}>
                  <Item
                    value={comp}
                    onEdit={onEditComponent}
                    onRemove={onRemoveComponent}
                  />
                </Col>
              );
            })}
        </Row>
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
                <Col span={12} key={v.id} style={{ padding: '6px' }}>
                  <div
                    className={styles.componentView}
                    onClick={() => {
                      onCateClick(v, false);
                    }}
                  >
                    <div className={styles.componentImg}>
                      <IconFont
                        type={v.icon || ''}
                        style={{ fontSize: '48px' }}
                      />
                    </div>
                    <div className={styles.componentTitle}>{v.name}</div>
                  </div>
                </Col>
              );
            })}
        </Row>
      );
    };

    return (
      <section className={styles.bar}>
        <div className={styles.category}>
          <div>
            <Tooltip placement="right" title="上传组件" key="上传组件">
              <div className={styles.icon} onClick={onShow}>
                <IconFont type="icon-Group-" style={{ color: '#FFF' }} />
              </div>
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
              {!currType.children && showComponents()}
              {currType.children && showChildrenType()}
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

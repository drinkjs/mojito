import React from 'react';
import { Empty, Button, Modal, Input, Skeleton } from 'antd';
import { observer, inject } from 'mobx-react';
import {
  PlusOutlined,
  PictureOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import IconFont from 'components/IconFont';
import UploadImg from 'components/UploadImg';
import Image from 'components/Image';
import { ProjectDto, ScreenDto, ScreenStore } from 'types';
import styles from './screenList.module.scss';
import noData from 'resources/images/noData.png';
import Message from 'components/Message';

const { useCallback, useState, useEffect } = React;
const { confirm } = Modal;

interface Props {
  project: ProjectDto;
  screenStore?: ScreenStore;
}

export default inject('screenStore')(
  observer((props: Props) => {
    const { screenStore, project } = props;
    const [visible, setVisible] = useState(false);
    const [screenName, setScreenName] = useState('');
    const [editScreen, setEditScreen] = useState<ScreenDto>();
    const [uploading, setUploading] = useState('');

    useEffect(() => {
      if (project && project.id) {
        screenStore!.getList(project.id);
      }
    }, [project]);

    /**
     * 新增页面
     */
    const handleOk = useCallback(() => {
      if (!screenName) {
        Message.warning('请输入页面名称');
        return;
      }

      // 编辑页面
      if (editScreen) {
        if (editScreen.name === screenName) {
          handleCancel();
          return;
        }
        screenStore!.edit(editScreen.id, screenName, project.id).then(() => {
          handleCancel();
          screenStore!.getList(project.id);
        });
        return;
      }

      // 新增页面
      screenStore!.add(screenName, project.id).then(() => {
        handleCancel();
        screenStore!.getList(project.id);
      });
    }, [screenName, project]);

    /**
     * 取消新增页面
     */
    const handleCancel = useCallback(() => {
      setVisible(false);
      setScreenName('');
      setEditScreen(undefined);
    }, []);

    /**
     * 新增页面弹窗
     */
    const onAdd = useCallback(() => {
      setVisible(true);
    }, []);

    /**
     * 输入框change
     */
    const onInput = useCallback((e: React.ChangeEvent<any>) => {
      setScreenName(e.target.value);
    }, []);

    /**
     * 编辑页面
     */
    const handleEdit = useCallback(
      (e: React.MouseEvent<any>, data: ScreenDto) => {
        e.stopPropagation();
        setScreenName(data.name);
        setEditScreen(data);
        setVisible(true);
      },
      []
    );

    /**
     * 删除页面
     */
    const handleRemove = useCallback(
      (e: React.MouseEvent<any>, data: ScreenDto) => {
        e.stopPropagation();
        confirm({
          title: `确定删除${data.name}?`,
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            screenStore!.remove(data.id).then(() => {
              screenStore!.getList(project.id);
            });
          }
        });
      },
      [project]
    );

    /**
     * 跳转到布局页面
     */
    const gotoLayout = useCallback(
      (e: React.MouseEvent<any>, data: ScreenDto) => {
        // history.push(`/editor/screen/${data.id}`);
        window.location.href = `/editor/screen/${data.id}`;
      },
      []
    );

    /**
     * 上传
     */
    const onUploadImg = useCallback(
      (id: string, path: string | undefined) => {
        screenStore!
          .updateCover(id, path || '')
          .then(() => {
            screenStore!.getList(project.id);
          })
          .finally(() => {
            setUploading('');
          });
      },
      [project]
    );

    /**
     * 上传图片进度
     */
    const onProcess = useCallback((id: string) => {
      setUploading(id);
    }, []);

    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <div>
            <span style={{ marginLeft: '6px' }}>
              【{project ? project.name : ''}】
            </span>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ borderRadius: '4px' }}
            onClick={onAdd}
            disabled={!(project && project.id)}
          >
            新建页面
          </Button>
        </header>
        <Skeleton loading={screenStore!.getListLoading}>
          <div
            className={styles.screenBox}
            style={{
              alignContent:
                screenStore!.screenList.length === 0 ? 'center' : 'flex-start'
            }}
          >
            {project &&
              project.id &&
              screenStore!.screenList.map((v) => {
                return (
                  <div key={v.id} style={{ padding: '12px' }}>
                    <div className={styles.item}>
                      <div className={styles.toolBar}>
                        <UploadImg
                          showFile={false}
                          listType="text"
                          onChange={(path) => {
                            onUploadImg(v.id, path);
                          }}
                          onProcess={() => {
                            onProcess(v.id);
                          }}
                          data={{ id: v.id }}
                        >
                          <a title="封面" className={styles.coverIcon}>
                            <IconFont type="icon-ico_uploadpic" />
                          </a>
                        </UploadImg>
                        <a
                          title="预览"
                          rel="noreferrer"
                          target="_blank"
                          href={`/screen/${v.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <IconFont type="icon-chakan" />
                        </a>
                        <a
                          title="编辑"
                          onClick={(e) => {
                            handleEdit(e, v);
                          }}
                        >
                          <IconFont type="icon-edit-square" />
                        </a>
                        <a
                          title="删除"
                          onClick={(e) => {
                            handleRemove(e, v);
                          }}
                        >
                          <IconFont type="icon-shanchu1" />
                        </a>
                      </div>
                      <div
                        className={styles.itemPre}
                        onClick={(e) => {
                          gotoLayout(e, v);
                        }}
                      >
                        {uploading !== v.id
                          ? (
                              v.coverImg
                                ? (
                            <Image src={v.coverImg} />
                                  )
                                : (
                            <PictureOutlined style={{ color: '#666' }} />
                                  )
                            )
                          : (
                          <LoadingOutlined />
                            )}
                      </div>
                      <div className={styles.itemName}>
                        <div
                          style={{
                            fontSize: '16px',
                            height: '25px',
                            overflow: 'hidden'
                          }}
                        >
                          {v.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#92abcf' }}>
                          {v.updateTime}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {screenStore!.screenList.length === 0 && (
              <Empty
                image={noData}
                style={{ margin: 'auto' }}
                imageStyle={{
                  height: 289
                }}
                description={
                  <span style={{ fontSize: '18px' }}>
                    {project ? '暂没页面信息' : '请选择项目'}
                  </span>
                }
              >
                {/* <Button type="primary" onClick={onAdd}>
                  新建页面
                </Button> */}
              </Empty>
            )}
          </div>
        </Skeleton>

        <Modal
          title="页面名称"
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose
          confirmLoading={screenStore!.addLoading}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
        >
          <Input
            placeholder="请输入页面名称"
            onChange={onInput}
            value={screenName}
            onPressEnter={handleOk}
          />
        </Modal>
      </div>
    );
  })
);

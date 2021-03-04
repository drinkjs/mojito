import React, { useCallback, useState, useEffect } from 'react';
import { Empty, Button, Modal, Input, Skeleton } from 'antd';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';
import { PlusOutlined } from '@ant-design/icons';
import { ProjectDto, ProjectStore } from 'types';
import ProjectItemList from './components/projectItemList';
import ScreenList from './components/screenList';
import CdnModal from './components/CdnModal';
import styles from './index.module.scss';
import noProject from 'resources/images/noProject.png';
import Message from 'components/Message';
import logo from 'resources/images/logo.png';

// const { useCallback, useState, useEffect } = React;

interface Props {
  projectStore: ProjectStore;
}

export default inject('projectStore')(
  observer((props: Props) => {
    const { projectStore } = props;
    const { projectList } = projectStore;

    const [visible, setVisible] = useState(false);
    const [cdnVisible, setCdnVisible] = useState(false);
    const [projectName, setProjectName] = useState<string>();
    const [selectedProject, setSelectedProject] = useState<ProjectDto>();
    const [editProject, setEditProject] = useState<ProjectDto>();

    useEffect(() => {
      const selectedProjectCache = localStorage.getItem('selectedProject');
      const sel = selectedProjectCache
        ? JSON.parse(selectedProjectCache)
        : undefined;
      if (sel && sel.id) {
        setSelectedProject(sel);
      }
      projectStore!.getList();
    }, []);

    /**
     * 新增项目
     */
    const handleOk = useCallback(
      (e: any) => {
        if (!projectName) {
          Message.warning('请输入项目名称');
          return;
        }
        // 编辑项目
        if (editProject) {
          if (editProject.name === projectName) {
            handleCancel();
            setEditProject(undefined);
            return;
          }
          projectStore!.edit(editProject.id, projectName).then(() => {
            handleCancel();
            setEditProject(undefined);
            projectStore!.getList();
          });
          return;
        }
        // 新增项目
        projectStore!.add(projectName).then(() => {
          handleCancel();
          projectStore!.getList().then((data) => {
            if (data) {
              onSelectProject(data[0]);
            }
          });
        });
      },
      [projectName, editProject]
    );

    /**
     * 取消新增项目
     */
    const handleCancel = useCallback(() => {
      setVisible(false);
      setProjectName(undefined);
    }, []);

    /**
     * 新增项目弹窗
     */
    const onAddProject = useCallback(() => {
      setVisible(true);
    }, []);

    /**
     * 输入框change
     */
    const onInput = useCallback((e: React.ChangeEvent<any>) => {
      setProjectName(e.target.value);
    }, []);

    /**
     * 选择项目
     */
    const onSelectProject = useCallback((data?: ProjectDto) => {
      setSelectedProject(toJS(data));
      localStorage.setItem(
        'selectedProject',
        data ? JSON.stringify(data) : '{}'
      );
    }, []);

    /**
     * 编辑项目
     */
    const onEditProject = useCallback((data: ProjectDto) => {
      setEditProject(toJS(data));
      setProjectName(data.name);
      setVisible(true);
    }, []);

    /**
     * 删除项目
     */
    const onRemoveProject = useCallback(
      (data: ProjectDto) => {
        projectStore!.remove(data.id).then(() => {
          projectStore!.getList().then((datas: any[]) => {
            // console.log(selectedProject.id, data.id)
            if (!datas || datas.length === 0) {
              onSelectProject();
            } else if (selectedProject && selectedProject.id === data.id) {
              onSelectProject(datas[0]);
            }
          });
        });
      },
      [selectedProject]
    );

    const onEditCdn = useCallback((data: ProjectDto) => {
      setEditProject(data);
      setCdnVisible(true);
    }, []);

    const onCdnCancel = useCallback(() => {
      setCdnVisible(false);
    }, []);

    /**
     * 保存cdn
     */
    const onCdnSave = useCallback(
      (cdns?: string[]) => {
        if (!editProject || !cdns) {
          return;
        }
        projectStore!.updateCDN(editProject.id, cdns).then(() => {
          onCdnCancel();
          setEditProject(undefined);
          projectStore!.getList();
        });
      },
      [editProject]
    );

    // return <div>xxxxxxxxxxxxx</div>

    return (
      <div style={{ display: 'flex', height: '100%' }}>
        <Skeleton
          loading={
            projectStore!.projectList.length === 0
              ? projectStore!.getListLoading
              : false
          }
        >
          <>
            {projectList.length === 0 && (
              <Empty
                image={noProject}
                style={{ margin: 'auto' }}
                imageStyle={{
                  height: 289,
                  width: 381
                }}
                description={
                  <span style={{ fontSize: '18px' }}>暂没项目信息</span>
                }
              >
                <Button type="primary" onClick={onAddProject}>
                  新建项目
                </Button>
              </Empty>
            )}
            {projectList.length > 0 && (
              <>
                <div className={styles.projectListBox}>
                  <div style={{ textAlign: 'center', margin: '12px 0' }}>
                    <img src={logo} height={100} />
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block
                    style={{
                      height: '40px',
                      borderRadius: '4px',
                      fontSize: '18px'
                    }}
                    onClick={onAddProject}
                  >
                    创建项目
                  </Button>
                  <div style={{ flexGrow: 1, height: '100%' }}>
                    <ProjectItemList
                      value={projectList}
                      onSelect={onSelectProject}
                      selected={selectedProject ? selectedProject.id : ''}
                      onEdit={onEditProject}
                      onRemove={onRemoveProject}
                      onCdn={onEditCdn}
                    />
                  </div>
                </div>
                <div className={styles.screenBox}>
                  {selectedProject && <ScreenList project={selectedProject} />}
                </div>
              </>
            )}
          </>
        </Skeleton>
        <Modal
          title="项目名称"
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose
          confirmLoading={projectStore!.addLoading}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
        >
          <Input
            placeholder="请输入项目名称"
            onChange={onInput}
            value={projectName}
            onPressEnter={handleOk}
          />
        </Modal>
        <CdnModal
          visible={cdnVisible}
          onCancel={onCdnCancel}
          onConfirm={onCdnSave}
          projectName={editProject ? editProject.name : ''}
          value={editProject ? editProject.cdn : undefined}
        />
      </div>
    );
  })
);

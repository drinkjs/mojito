import { useState } from "react";
import { useGlobalStore } from "@/store";
import { useMount, useUpdateEffect } from "ahooks";
import { Button, Input, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import classNames from "classnames";
import styles from "../styles/projectList.module.css"
import IconFont from "@/components/IconFont";
import { dateFormat } from "@/common/util";

export default function ProjectList({onSelect}: ProjectListProps){
	const { projectStore } = useGlobalStore();
	const [selected, setSelected] = useState<ProjectInfo | undefined>();
  const [visible, setVisible] = useState(false);
  const [projectName, setProjectName] = useState<string | undefined>();
  const [editProject, setEditProject] = useState<ProjectInfo | undefined>()

	useMount(() => {
    if(projectStore.list.length === 0){
      projectStore.getList();
    }
    const item = localStorage.getItem("selectedProject");
    if(item){
      selectHandler(JSON.parse(item))
    }
	});

  /**
   * 选中项目
   */
  const selectHandler = (item?:ProjectInfo)=>{
    setSelected(item);
    onSelect(item);
    if(item){
      localStorage.setItem("selectedProject", JSON.stringify(item));
    }else{
      localStorage.removeItem("selectedProject");
    }
  }

  
  useUpdateEffect(()=>{
    if (projectStore.list) {
      // 默认选中第一个
      selectHandler(projectStore.list[0]);
    }
  }, [projectStore.list])

  /**
     * 新增项目
     */
   const handleOk = () => {
      if (!projectName) {
        message.warning("请输入项目名称");
        return;
      }
      // 编辑项目
      if (editProject) {
        if (editProject.name === projectName) {
          handleCancel();
          return;
        }
        projectStore.update(editProject.id, projectName).then(() => {
          handleCancel();
        });
        return;
      }
      // 新增项目
      projectStore.add(projectName).then(() => {
        handleCancel();
      });
    };

  /**
   * 取消新增项目
   */
  const handleCancel = () => {
    setVisible(false);
    setProjectName(undefined);
    setEditProject(undefined);
  };

  /**
   * 编辑项目
   * @param e 
   * @param data 
   */
  const handleEdit = (e: React.MouseEvent<any>, data: ProjectInfo) => {
    e.stopPropagation();
    setEditProject(data);
    setProjectName(data.name);
    setVisible(true);
  };

  /**
   * 删除项目
   * @param e 
   * @param data 
   */
  const handleRemove = (e: React.MouseEvent<any>, data: ProjectInfo) => {
    e.stopPropagation();
    Modal.confirm({
      title: `确定删除${data.name}?`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        projectStore.remove(data.id).then(()=>{
          if(data.id === selected?.id){
            selectHandler(projectStore.list[0])
          }
          message.success("删除成功");
        })
      }
    });
  };

	return (
		<div>
			<div className="mgTop-12">
				<Button
					type="primary"
					icon={<PlusOutlined />}
					block
					size="large"
					onClick={()=>{setVisible(true)}}
				>
					创建项目
				</Button>
			</div>
			<h1 className={styles.title}>项目列表</h1>
			<div>
			{projectStore.list.map((item) => {
          return (
            <div
              className={classNames(styles.projectItem, {
                [styles.projectItemSelected]: selected?.id === item.id
              })}
              key={item.name}
              onClick={() => {
                selectHandler(item);
              }}
            >
              <div className={styles.projectName}>{item.name}</div>
              <div style={{ marginTop: '12px' }}>{item.createAt && dateFormat(item.createAt)}</div>
              <div className={styles.toolBar}>
                <a
                  onClick={(e) => {
                    handleEdit(e, item);
                  }}
                >
                  <IconFont type="icon-edit-square" />
                </a>
                <a
                  onClick={(e) => {
                    handleRemove(e, item);
                  }}
                >
                  <IconFont type="icon-shanchu1" />
                </a>
              </div>
            </div>
          );
        })}
			</div>
      <Modal
          title="项目名称"
          open={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          destroyOnClose
          confirmLoading={projectStore.addLoading}
          maskClosable={false}
          okText="确定"
          cancelText="取消"
        >
          <Input
            placeholder="请输入项目名称"
            onChange={(e)=>{setProjectName(e.target.value)}}
            onPressEnter={handleOk}
            value={projectName}
          />
        </Modal>
		</div>
	);
}

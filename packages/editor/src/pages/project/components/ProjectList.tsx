import { useState } from "react";
import { useStore } from "@/store";
import { useMount } from "ahooks";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import classNames from "classnames";
import styles from "../styles/projectList.module.css"
import IconFont from "@/components/IconFont";

interface ProjectListProps {
  onSelect:(item:ProjectInfo)=>void
}

export default function ProjectList({onSelect}: ProjectListProps){
	const { projectStore } = useStore();
	const [selected, setSelected] = useState<ProjectInfo | undefined>()

	useMount(() => {
		projectStore.getList();
	});


	const onAddProject = ()=>{
		console.log("add")
	}

  const selectHandler = (item:ProjectInfo)=>{
    setSelected(item);
    onSelect(item)
  }

	return (
		<div>
			<div className="mgTop-12">
				<Button
					type="primary"
					icon={<PlusOutlined />}
					block
					size="large"
					onClick={onAddProject}
				>
					创建项目
				</Button>
			</div>
			<h1 className={styles.title}>项目列表</h1>
			<div>
			{projectStore.projectList.map((item) => {
          return (
            <div
              className={classNames(styles.projectItem, {
                [styles.projectItemSelected]: selected === item
              })}
              key={item.name}
              onClick={() => {
                selectHandler(item);
              }}
            >
              <div className={styles.projectName}>{item.name}</div>
              <div style={{ marginTop: '12px' }}>{item.createTime}</div>
              <div className={styles.toolBar}>
                <a
                  onClick={(e) => {
                    // handleEdit(e, v);
                  }}
                >
                  <IconFont type="icon-edit-square" />
                </a>
                <a
                  onClick={(e) => {
                    // handleRemove(e, v);
                  }}
                >
                  <IconFont type="icon-shanchu1" />
                </a>
              </div>
            </div>
          );
        })}
			</div>
		</div>
	);
}

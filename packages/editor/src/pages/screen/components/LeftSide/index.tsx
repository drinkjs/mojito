import classNames from "classnames";
import IconFont from "@/components/IconFont";
import { useGlobalStore } from "@/store";
import { Popover, Tooltip } from "antd";
import { useEffect, useState } from "react";
import ComponentTypeList from "./ComponentTypeList";
import { ComponentList } from "./ComponentList";
import AddComponent from "./AddComponent";
import styles from "./index.module.css";

export default function LeftSide() {
	const { componentStore } = useGlobalStore();
	const [showList, setShowList] = useState(false);
	// 已选中的类型
	const [currRoot, setCurrRoot] = useState<ComponentTypeTree>();
	const [showAdd, setShowAdd] = useState(false);
	const [showComponent, setShowComponent] = useState(false);

	useEffect(() => {
		componentStore.getTypeTree();
	}, [componentStore]);

	useEffect(()=>{
		if(!showComponent){
			setCurrRoot(undefined)
		}
	}, [showComponent])

	const onCateClick = (category: ComponentTypeTree) => {
		setShowComponent(true);
		setCurrRoot(category);
	};

	return (
		<aside className={styles.left}>
			<div className={styles.category}>
				<div key="上传组件">
					<Tooltip placement="right" title="上传组件">
						<div
							className={styles.icon}
							onClick={() => {
								setShowAdd(true);
							}}
						>
							<IconFont type="icon-upload" />
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
							arrow
							onOpenChange={(visible) => {
								if (visible) {
									setShowComponent(false);
								}
								setShowList(visible);
							}}
						>
							<div
								className={classNames(styles.icon, {
									[styles.iconSelected]: showList,
								})}
							>
								<IconFont
									type="icon-shezhi"
									style={{ color: showList ? "#000" : "inherit" }}
								/>
							</div>
						</Popover>
					</Tooltip>
				</div>
				{componentStore.typeTree.map((v) => {
					return (
						<Tooltip placement="right" title={v.name} key={v.name}>
							<div
								className={classNames(styles.icon, {
									[styles.iconSelected]: currRoot && currRoot.id === v.id,
								})}
								onClick={() => {
									onCateClick(v);
								}}
							>
								<IconFont type={v.icon || ""} />
							</div>
						</Tooltip>
					);
				})}
			</div>
			<ComponentList
				visible={showComponent}
				componentType={currRoot}
				onClose={() => {
					setShowComponent(false);
				}}
			/>
			<AddComponent open={showAdd} onCancel={()=>{setShowAdd(false)}} />
		</aside>
	);
}

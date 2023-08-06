import { Table, Button, Space, Modal, message } from "antd";
import { useState, useMemo } from "react";
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	CloseOutlined,
	SettingOutlined,
} from "@ant-design/icons";
// import IconFont from "@/components/IconFont";
import { useGlobalStore } from "@/store";
// import { getTreeAllParent } from "@mojito/common/util";
import styles from "./index.module.css";
import AddType from "./AddType";
import AddIconFont from "./AddIconFont";

export default function ComponentTypeList({
	visible,
	onClose,
	IconFont
}: {
	visible: boolean;
	onClose: () => void;
	IconFont: any
}) {
	const { componentStore } = useGlobalStore();
	const [value, setValue] = useState<ComponentTypeTree>();
	// const [parentValue, setParentValue] = useState<string[]>();
	const [showAdd, setShowAdd] = useState(false);
	const [showAddIconFont, setShowAddIconFont] = useState(false);
	const [modal, contextHolder] = Modal.useModal();

	const userTypes = useMemo(() => {
		return componentStore.typeTree.filter((v) => v.origin !== 999);
	}, [componentStore.typeTree]);

	const columns = [
		{
			title: "分类名称",
			dataIndex: "name",
			key: "name",
			render: (text: string, recond: ComponentTypeTree) => {
				return (
					<div>
						<IconFont type={recond.icon || "icon-zujian-"} />
						<span style={{ marginLeft: "12px" }}>{text}</span>
					</div>
				);
			},
		},
		{
			title: "操作",
			dataIndex: "id",
			key: "id",
			width: 80,
			render: (_: string, recond: ComponentTypeTree) => {
				return (
					<Space>
						<Button
							type="link"
							size="small"
							icon={<EditOutlined />}
							onClick={() => {
								onEdit(recond);
							}}
						></Button>
						<Button
							type="link"
							size="small"
							icon={<DeleteOutlined />}
							onClick={() => {
								onRemove(recond);
							}}
						></Button>
					</Space>
				);
			},
		},
	];

	const onCancel = () => {
		setShowAdd(false);
		setShowAddIconFont(false);
		setValue(undefined);
		// setParentValue(undefined);
	};

	const onRemove = (recond: ComponentTypeTree) => {
		if (recond.children && recond.children.length > 0) {
			message.error(`${recond.name}下存在多个子类，请先删除子类`);
			return;
		}
		modal.confirm({
			title: `确定删除${recond.name}?`,
			zIndex: 2000,
			onOk: () => {
				componentStore.removeType(recond.id);
			},
		});
	};

	const onEdit = (recond: ComponentTypeTree) => {
		setValue(recond);
		setShowAdd(true);
		// const pv = getTreeAllParent(componentStore.typeTree, recond.id, true);
		// if (pv.length > 0) {
		// 	setParentValue(pv.map((v) => v.id));
		// } else {
		// 	setParentValue(undefined);
		// }
	};

	// const filterOpts = () => {
	// 	const tree = componentStore.typeTree;
	// 	if (!value?.pid) {
	// 		return tree.filter((v) => v.id !== value?.id);
	// 	}
	// 	const pItem = getTreeItem(tree, value?.pid);
	// 	if (pItem && pItem.children) {
	// 		// 过滤自身节点
	// 		pItem.children = pItem.children.filter((v: any) => v.id !== value?.id);
	// 	}
	// 	return tree;
	// };

	return (
		<div
			className={styles.components}
			style={{
				display: visible ? "flex" : "none",
			}}
		>
			<div className={styles.componentListTitle}>
				<div className={styles.name}>分类管理</div>
				<a className={styles.close} href={void 0} onClick={onClose}>
					<CloseOutlined />
				</a>
			</div>
			<div style={{ overflow: "auto" }}>
				<Table
					columns={columns}
					dataSource={userTypes}
					pagination={false}
					showHeader={false}
					rowKey="id"
				/>
			</div>
			<div style={{ padding: "12px" }}>
				<Button
					block
					type="primary"
					onClick={() => {
						setShowAdd(true);
					}}
					icon={<PlusOutlined />}
				>
					新增分类
				</Button>
				<Button
					style={{ marginTop: "12px" }}
					block
					onClick={() => {
						setShowAddIconFont(true);
					}}
					icon={<SettingOutlined />}
				>
					设置图标库
				</Button>
			</div>
			<AddType open={showAdd} onCancel={onCancel} value={value} />
			<AddIconFont
				open={showAddIconFont}
				onCancel={onCancel}
				value={componentStore.iconfont}
			/>
			{contextHolder}
		</div>
	);
}

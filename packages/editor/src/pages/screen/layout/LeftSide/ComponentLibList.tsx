import { Table, Button, Modal, Select, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { PlusOutlined, DeleteOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
import { useGlobalStore } from "@/store";
import styles from "./index.module.css";
import AddComponent from "./AddComponent";

export default function ComponentLibList({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) {
	const { componentStore } = useGlobalStore();
	const { typeTree, componentLibs, getLibsLoading } = componentStore;
	const [value, setValue] = useState<ComponentPackInfo>();
	const [showAdd, setShowAdd] = useState(false);
	const [modal, contextHolder] = Modal.useModal();
	const [options, setOptions] = useState<{ value: string; label: string }[]>(
		[]
	);
	const [selectType, setSelectType] = useState<string | undefined>();

	useEffect(() => {
		// 默认选中第一个
		setSelectType(typeTree[0]?.id);
		// 设置下拉组件数据
		setOptions(
			typeTree.map((v) => ({
				value: v.id,
				label: v.name,
			}))
		);
	}, [typeTree]);

	/**
	 * 获取组件库
	 */
	useEffect(() => {
		if (selectType) {
			componentStore.getComponentLibs(selectType);
		}
	}, [selectType, componentStore]);

	const userLibs = useMemo(() => {
		return componentLibs.filter((v) => v.origin !== 999);
	}, [componentLibs]);

	const columns = [
		{
			title: "组件名称",
			dataIndex: "name",
			ellipsis: true,
			render: (_: string, recond: ComponentPackInfo) => {
				return `${recond.name}@${recond.version}`;
			},
		},
		{
			title: "操作",
			dataIndex: "id",
			width: 80,
			render: (_: string, recond: ComponentPackInfo) => {
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

	const onRemove = (recond: ComponentPackInfo) => {
		modal.confirm({
			title: `确定删除${recond.name}?`,
			zIndex: 2000,
			onOk: () => {
				componentStore.removeComponentLib(recond.id).then(() => {
					if (selectType) {
						componentStore.getComponentLibs(selectType);
					}
				});
			},
		});
	};

	const onEdit = (recond: ComponentPackInfo) => {
		setValue(recond);
		setShowAdd(true);
	};

	const onSelectType = (value?: string) => {
		setSelectType(value);
	};

	// const onEdit = (recond: ComponentPackInfo) => {
	// 	setValue(recond);
	// 	setShowAdd(true);
	// 	const pv = getTreeAllParent(
	// 		componentStore.typeTree,
	// 		recond.id,
	// 		true
	// 	);
	// 	if (pv.length > 0) {
	// 		setParentValue(pv.map((v) => v.id));
	// 	} else {
	// 		setParentValue(undefined);
	// 	}
	// };

	return (
		<div
			className={styles.components}
			style={{
				display: visible ? "flex" : "none",
			}}
		>
			<div className={styles.componentListTitle}>
				<div className={styles.name}>组件库管理</div>
				<a className={styles.close} href={void 0} onClick={onClose}>
					<CloseOutlined />
				</a>
			</div>
			<div className={styles.componentSelect}>
				<Select
					options={options}
					onChange={onSelectType}
					value={selectType}
					style={{ width: "100%", border: "none" }}
				/>
			</div>
			<div style={{ overflow: "auto" }}>
				<Table
					columns={columns}
					dataSource={userLibs}
					pagination={false}
					showHeader={false}
					rowKey="id"
					loading={getLibsLoading}
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
					新增组件库
				</Button>
			</div>
			{contextHolder}
			<AddComponent
				value={value}
				open={showAdd}
				onCancel={() => {
					setShowAdd(false);
				}}
				onOk={() => {
					if (selectType) {
						componentStore.getComponentLibs(selectType);
					}
					setShowAdd(false);
					setValue(undefined);
				}}
			/>
		</div>
	);
}

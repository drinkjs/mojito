import { useGlobalStore } from "@/store";
import {
	PlusOutlined,
	PictureOutlined,
	LoadingOutlined,
} from "@ant-design/icons";
import IconFont from "@/components/IconFont";
import { Modal, Button, Skeleton, Empty, Input, message } from "antd";
import { useState, useEffect, useCallback } from "react";
import styles from "../styles/screenList.module.css";
import UploadImg from "@/components/UploadImg";
import Image from "@/components/Image";
import noData from "@/assets/noData.webp";
import { useNavigate } from "react-router-dom";
import { dateFormat } from "@/common/util";

interface ScreenListProps {
	project?: ProjectInfo;
}

export default function ScreenList({ project }: ScreenListProps) {
	const { screenStore } = useGlobalStore();
	const [visible, setVisible] = useState(false);
	const [screenName, setScreenName] = useState("");
	const [editScreen, setEditScreen] = useState<ScreenInfo>();
	const [uploading, setUploading] = useState("");
	const nav = useNavigate();

	const [modal, contextHolder] = Modal.useModal();

	useEffect(() => {
		if (project?.id) {
			screenStore.getList(project.id);
		} else {
			// screenStore.list = [];
		}
	}, [project?.id, screenStore]);

	/**
	 * 新增页面
	 */
	const handleOk = () => {
		if (!project) return;

		if (!screenName) {
			message.warning("请输入页面名称");
			return;
		}

		// 编辑页面
		if (editScreen) {
			if (editScreen.name === screenName) {
				handleCancel();
				return;
			}
			screenStore
				.edit(editScreen.id, screenName, editScreen.projectId)
				.then(() => {
					handleCancel();
					screenStore.getList(editScreen.projectId);
				});
			return;
		}

		// 新增页面
		screenStore.add(screenName, project.id).then(() => {
			handleCancel();
			screenStore.getList(project.id);
		});
	};

	/**
	 * 取消新增页面
	 */
	const handleCancel = () => {
		setVisible(false);
		setScreenName("");
		setEditScreen(undefined);
	};

	/**
	 * 新增页面弹窗
	 */
	const onAdd = () => {
		setVisible(true);
	};

	/**
	 * 输入框change
	 */
	const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setScreenName(e.target.value);
	};

	/**
	 * 编辑页面
	 */
	const handleEdit = (e: React.MouseEvent, data: ScreenInfo) => {
		e.stopPropagation();
		setScreenName(data.name);
		setEditScreen(data);
		setVisible(true);
	};

	/**
	 * 删除页面
	 */
	const handleRemove = (e: React.MouseEvent, data: ScreenInfo) => {
		e.stopPropagation();
		if (!project) return;

		modal.confirm({
			title: `确定删除${data.name}?`,
			okText: "确定",
			cancelText: "取消",
			onOk: () => {
				screenStore.remove(data).then(() => {
					message.success("删除成功")
				});
			},
		});
	};

	/**
	 * 跳转到布局页面
	 */
	const gotoEditor = (data: ScreenInfo) => {
			nav(`/editor/${data.id}`);
	};

	/**
	 * 上传
	 */
	const onUploadImg = (id: string, path: string | undefined) => {
		if (!project) return;

		screenStore
			.updateCover(id, path || "")
			.then(() => {
				screenStore.getList(project.id);
			})
			.finally(() => {
				setUploading("");
			});
	};

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
					<h2 style={{ marginLeft: "6px" }}>
						{project ? project.name : ""}
					</h2>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					style={{ borderRadius: "4px" }}
					onClick={onAdd}
					disabled={!(project && project.id)}
				>
					新建页面
				</Button>
			</header>
			<Skeleton loading={screenStore.getListLoading}>
				{screenStore.list.length === 0 ? (
					<Empty
						image={noData}
						style={{ margin: "auto" }}
						imageStyle={{
							height: 289,
						}}
						description={
							<span style={{ fontSize: "18px" }}>
								{project ? "暂没页面信息" : "暂无数据"}
							</span>
						}
					>
					</Empty>
				) : (
					<div className={styles.screenBox}>
						{project &&
							project.id &&
							screenStore.list.map((v) => {
								return (
									<div key={v.id} className={styles.itemBox}>
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
												>
													<a title="上传封面" className={styles.coverIcon}>
														<IconFont type="icon-ico_uploadpic" />
													</a>
												</UploadImg>
												<a
													title="预览"
													rel="noreferrer"
													target="_blank"
													href={`/preview/${v.id}`}
													onClick={(e) => {
														e.stopPropagation();
													}}
													className={styles.coverIcon}
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
												onClick={() => {
													gotoEditor(v);
												}}
											>
												{uploading !== v.id ? (
													v.coverImg ? (
														<Image src={v.coverImg} />
													) : (
														<PictureOutlined />
													)
												) : (
													<LoadingOutlined />
												)}
											</div>
											<div className={styles.itemName}>
												<div
													style={{
														height: "25px",
														overflow: "hidden",
													}}
												>
													{v.name}
												</div>
												<div style={{ fontSize: "12px", color: "#92abcf" }}>
													最近更新时间：{dateFormat(v.updateAt)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
					</div>
				)}
			</Skeleton>

			<Modal
				title="页面名称"
				open={visible}
				onOk={handleOk}
				onCancel={handleCancel}
				destroyOnClose
				confirmLoading={screenStore.addLoading}
				maskClosable={false}
				okText="确定"
				cancelText="取消"
			>
				<Input
					placeholder="请输入页面名称"
					onChange={onInput}
					value={screenName?.replace("/", "")}
					onPressEnter={handleOk}
				/>
			</Modal>
			{contextHolder}
		</div>
	);
}

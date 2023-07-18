import IconFont, { IconLink } from "@/components/IconFont";
import {
	LoadingOutlined,
	MinusOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { Switch, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCanvasStore } from "../hook";
import styles from "../styles/header.module.css";

const toolStyles = {
	margin: "0 6px",
};

interface HeaderProps {
	// canvasStore:Canvas
}

export default function Header(props: HeaderProps) {
	const [saveing, setSaveing] = useState(false);

	const { canvasStore } = useCanvasStore();
	const { scale, screenInfo } = canvasStore;

	const alignHandler = (align: string) => {
		console.log("alignHandler");
	};

	const saveScreen = async () => {
		setSaveing(true);
		await canvasStore.saveScreen();
		setSaveing(false);
	};

	const undo = () => {
		console.log("undo");
	};

	const redo = () => {
		console.log("redo");
	};

	const groupLayer = () => {
		console.log("groupLayer");
	};

	const disbandLayer = () => {
		console.log("disbandLayer");
	};

	return (
		<header className={styles.header}>
			<section className={styles.titleBox}>
				<div>
					<Link to="..">
						<IconFont type="icon-fanhui1" className={styles.backIcon} />
					</Link>
					{screenInfo?.name && (
						<strong className={styles.title}>{screenInfo.name}</strong>
					)}
				</div>
				<div className={styles.zoomBox}>
					<div
						onClick={() => {
							canvasStore.zoom(false);
						}}
						className={styles.zoomBtn}
					>
						<MinusOutlined />
					</div>
					<Tooltip placement="bottom" title="自适应">
						<div
							onClick={() => {
								canvasStore.zoomAuto();
							}}
							style={{ width: "50px" }}
							className={styles.zoomBtn}
						>
							{(scale * 100).toFixed(0)}%
						</div>
					</Tooltip>
					<div
						onClick={() => {
							canvasStore.zoom(true);
						}}
						className={styles.zoomBtn}
					>
						<PlusOutlined />
					</div>
				</div>
			</section>
			<section className={styles.toolBox}>
				<span style={{ ...toolStyles, fontSize: "12px" }}>
					事件锁定
					<Switch
						size="small"
						style={toolStyles}
						checked={canvasStore.currLayer && canvasStore.currLayer.eventLock}
						onChange={(checked) => {
							canvasStore.currLayer &&
								canvasStore.updateLayer(canvasStore.currLayer.id, {
									eventLock: checked,
								});
						}}
						disabled={!canvasStore.currLayer}
					/>
				</span>

				{saveing ? (
					<LoadingOutlined style={toolStyles} />
				) : (
					<IconLink
						icon="icon-baocun"
						style={toolStyles}
						onClick={() => {
							saveScreen();
						}}
						title="保存(Ctrl+S)"
					/>
				)}
				<IconLink
					icon="icon-zuoduiqi-"
					style={toolStyles}
					onClick={() => {
						alignHandler("left");
					}}
					title="左对齐"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-dingduanduiqi-"
					style={toolStyles}
					onClick={() => {
						alignHandler("top");
					}}
					title="顶部对齐"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-youduiqi-"
					style={toolStyles}
					onClick={() => {
						alignHandler("right");
					}}
					title="右对齐"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-dingduanduiqi--copy"
					style={toolStyles}
					onClick={() => {
						alignHandler("bottom");
					}}
					title="底部对齐"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-align-level"
					style={toolStyles}
					onClick={() => {
						alignHandler("v-center");
					}}
					title="水平居中"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-align-vertical"
					style={toolStyles}
					onClick={() => {
						alignHandler("h-center");
					}}
					title="垂直居中"
					disabled={canvasStore.selectedLayerIds.size < 1}
				/>
				<IconLink
					icon="icon-shuaxin1"
					style={toolStyles}
					onClick={() => {
						canvasStore.reloadLayer();
					}}
					title="刷新组件"
					disabled={canvasStore.selectedLayerIds.size !== 1}
				/>
				<IconLink
					icon="icon-suoding"
					className={canvasStore?.isLayerLock ? undefined : styles.noLockHide}
					style={toolStyles}
					disabled={canvasStore.selectedLayerIds.size === 0}
					title={
						canvasStore.isLayerLock ? "解锁组件(Ctrl+L)" : "锁定组件(Ctrl+L)"
					}
					onClick={() => {
						canvasStore?.lockLayer(!canvasStore.isLayerLock);
					}}
				/>
				<IconLink
					icon="icon-xianshi1"
					className={canvasStore?.isLayerHide ? styles.noLockHide : undefined}
					style={toolStyles}
					disabled={canvasStore.selectedLayerIds.size === 0}
					onClick={() => {
						canvasStore?.hideLayer(!canvasStore.isLayerHide);
					}}
					title={
						canvasStore?.isLayerHide ? "显示组件(Ctrl+H)" : "隐藏组件(Ctrl+H)"
					}
				/>
				<IconLink
					title="群组(Ctrl+G)"
					icon="icon-hebing"
					onClick={groupLayer}
					disabled={
						canvasStore.isSelectedGroup || canvasStore.selectedLayerIds.size < 2
					}
					style={toolStyles}
				/>
				<IconLink
					title="解散(Ctrl+B)"
					icon="icon-shoudongfenli"
					onClick={disbandLayer}
					disabled={
						!canvasStore?.isSelectedGroup || canvasStore?.layerGroup.length < 2
					}
					style={toolStyles}
				/>
				<IconLink
					title="撤销(Ctrl+Z)"
					icon="icon-zhongzuo1"
					onClick={undo}
					disabled={canvasStore.undoData.length === 0}
					style={toolStyles}
				/>
				<IconLink
					title="重做(Ctrl+Y)"
					icon="icon-zhongzuo"
					onClick={redo}
					disabled={canvasStore.redoData.length === 0}
					style={toolStyles}
				/>
				<IconLink title="预览" icon="icon-chakan" style={toolStyles} />
			</section>
		</header>
	);
}

import IconFont, { IconLink } from "@/components/IconFont";
import {
	LoadingOutlined,
	MinusOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { message, Switch, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCanvasStore } from "../hook";
import styles from "../styles/header.module.css";

const toolStyles = {
	margin: "0 6px",
};

export default function Header() {
	const [saveing, setSaveing] = useState(false);

	const { canvasStore } = useCanvasStore();
	const { scale, screenInfo } = canvasStore;

	const isNoSelect = canvasStore.selectedLayers.size === 0;

	const saveScreen = () => {
		setSaveing(true);
		canvasStore.saveScreen().then(() => {
			message.success("保存成功")
		}).finally(() => {
			setSaveing(false);
		})

	};

	const undo = () => {
		canvasStore.undo()
	};

	const redo = () => {
		canvasStore.redo()
	};

	const groupLayer = () => {
		canvasStore.groupLayer();
	};

	const disbandLayer = () => {
		canvasStore.disbandGroup();
	};

	const { isAllGroup, isAllHide, isAllLock, currLayer } = useMemo(() => {
		return {
			isAllGroup: canvasStore.isAllGroup,
			isAllHide: canvasStore.isAllHide,
			isAllLock: canvasStore.isAllLock,
			currLayer: canvasStore.selectedLayers.size === 1 ? Array.from(canvasStore.selectedLayers)[0] : undefined
		}
	}, [canvasStore, canvasStore.selectedLayers])

	return (
		<header className={styles.header}>
			<section className={styles.titleBox}>
				<div>
					<Link to="..">
						<IconFont type="icon-fanhui1" className={styles.backIcon} />
					</Link>
					<strong className={styles.title}>{screenInfo?.name}</strong>
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
				{currLayer && <Tooltip title="锁定后图层内组件将不会响应事件"><span style={{ ...toolStyles, fontSize: "12px" }}>
					事件锁定
					<Switch
						size="small"
						style={toolStyles}
						checked={currLayer.eventLock}
						onChange={(checked) => {
							canvasStore.eventLock(currLayer, checked);
						}}
					/>
				</span></Tooltip>}

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
						canvasStore.alignHandler("left");
					}}
					title="左对齐"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-dingduanduiqi-"
					style={toolStyles}
					onClick={() => {
						canvasStore.alignHandler("top");
					}}
					title="顶部对齐"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-youduiqi-"
					style={toolStyles}
					onClick={() => {
						canvasStore.alignHandler("right");
					}}
					title="右对齐"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-dingduanduiqi--copy"
					style={toolStyles}
					onClick={() => {
						canvasStore.alignHandler("bottom");
					}}
					title="底部对齐"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-align-level"
					style={toolStyles}
					onClick={() => {
						canvasStore.alignHandler("v-center");
					}}
					title="水平居中"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-align-vertical"
					style={toolStyles}
					onClick={() => {
						canvasStore.alignHandler("h-center");
					}}
					title="垂直居中"
					disabled={isNoSelect}
				/>
				<IconLink
					icon="icon-shuaxin1"
					style={toolStyles}
					onClick={() => {
						canvasStore.reloadLayer();
					}}
					title="刷新组件"
					disabled={canvasStore.selectedLayers.size === 0}
				/>
				<IconLink
					icon="icon-suoding"
					className={isAllLock ? undefined : styles.noLockHide}
					style={toolStyles}
					disabled={canvasStore.selectedLayers.size === 0}
					title={
						isAllLock ? "解锁组件(Ctrl+L)" : "锁定组件(Ctrl+L)"
					}
					onClick={() => {
						canvasStore.lockLayer(!isAllLock);
					}}
				/>
				<IconLink
					icon="icon-xianshi1"
					className={isAllHide ? styles.noLockHide : undefined}
					style={toolStyles}
					disabled={isNoSelect}
					onClick={() => {
						canvasStore.hideLayer(!isAllHide);
					}}
					title={
						isAllHide ? "显示组件(Ctrl+H)" : "隐藏组件(Ctrl+H)"
					}
				/>
				<IconLink
					title="群组(Ctrl+G)"
					icon="icon-hebing"
					onClick={groupLayer}
					disabled={
						isAllGroup || canvasStore.selectedLayers.size < 2
					}
					style={toolStyles}
				/>
				<IconLink
					title="解散(Ctrl+B)"
					icon="icon-shoudongfenli"
					onClick={disbandLayer}
					disabled={
						!isAllGroup || canvasStore.selectedLayers.size < 2
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

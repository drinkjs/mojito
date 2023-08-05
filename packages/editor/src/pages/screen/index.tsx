import { syncHelper } from "@/common/syncHelper";
import {
	useDocumentVisibility,
	useInterval,
	useMount,
	useUnmount,
} from "ahooks";
import { Spin } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useGlobalStore } from "@/store";
import Header from "./layout/Header";
import LeftSide from "./layout/LeftSide";
import Playground from "./layout/Playground";
import RightSide from "./layout/RightSide";
import { useCanvasStore } from "./hook";
import styles from "./styles/index.module.css";
import { useCallback } from "react";

export default function Screen() {
	const { id, canvasStore, destroyStore } = useCanvasStore();
	const { screenStore } = useGlobalStore();
	const documentVisibility = useDocumentVisibility();

	const onStyleLoader = useCallback(
		(e: any) => {
			if (e.detail) {
				screenStore.receiveMojitoStyle(e.detail);
			}
		},
		[screenStore]
	);

	useMount(() => {
		document.title = "";
		document.addEventListener("__MojitoStyleLoader__", onStyleLoader);
		canvasStore.getDetail(id).then((data) => {
			syncHelper.join(id);
			document.title = data?.screenInfo.name || "";
		});
	});

	useUnmount(() => {
		document.title = "";
		destroyStore();
		syncHelper.leave();
		document.removeEventListener("__MojitoStyleLoader__", onStyleLoader);
	});

	/**
	 * 定时保存画布信息
	 */
	useInterval(() => {
		if (documentVisibility === "visible") {
			canvasStore.saveScreen();
		}
	}, 3000);

	return (
		<div className={styles.root}>
			<Header />
			<div className={styles.area}>
				<DndProvider backend={HTML5Backend}>
					<LeftSide />
					{canvasStore.getDetailLoading ? (
						<div
							style={{
								flex: 1,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Spin tip="Loading..." />
						</div>
					) : (
						<Playground />
					)}
				</DndProvider>
				<RightSide />
			</div>
		</div>
	);
}

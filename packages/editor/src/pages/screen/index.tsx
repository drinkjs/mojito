import { syncHelper } from "@/common/syncHelper";
import { useMount, useUnmount } from "ahooks";
import { Skeleton } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "./components/Header";
import LeftSide from "./components/LeftSide";
import Playground from "./components/Playground";
import RightSide from "./components/RightSide";
import { useCanvasStore } from "./hook";
import styles from "./styles/index.module.css";

export default function Screen() {
	const { id, canvasStore, destroyStore } = useCanvasStore();

	useMount(() => {
		document.title = ""
		canvasStore.getDetail(id).then((data)=>{
			syncHelper.join(id);
			document.title = data?.screenInfo.name ||  ""
		});
	});

	useUnmount(() => {
		document.title = "";
		destroyStore();
		syncHelper.leave();
	});

	return (
		<div className={styles.root}>
			<Header />
			<div className={styles.area}>
				<DndProvider backend={HTML5Backend}>
					<LeftSide />
					<Skeleton loading={canvasStore.getDetailLoading}>
						<Playground />
					</Skeleton>
				</DndProvider>
				<RightSide />
			</div>
		</div>
	);
}

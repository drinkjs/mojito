import { syncHelper } from "@/common/syncHelper";
import { useMount, useUnmount } from "ahooks";
import { Spin } from "antd";
import { useGlobalStore } from "@/store";
import { useCanvasStore } from "./hook";
import { useCallback, useState } from "react";
import Viewer from "./layout/Viewer";

export default function Screen() {
	const { id, canvasStore, destroyStore } = useCanvasStore();
	const { screenStore } = useGlobalStore();
	const [size, setSize] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0,
	});

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
		canvasStore.getDetail(id, true).then((data) => {
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
	 * 自适应
	 */
	//  useUpdateEffect(() => {
	// 	function handleResize () {
	// 		if (
	// 			!screenStore!.screenInfo?.style ||
	// 			!rootRef.current ||
	// 			!zoomRef.current
	// 		) {
	// 			return;
	// 		}
	// 		const { style } = screenStore!.screenInfo;
	// 		if (
	// 			style.width < window.innerHeight &&
	// 			style.height < window.innerHeight
	// 		) {
	// 			return;
	// 		}
	// 		let zoom = 1;
	// 		if (style.width > style.height) {
	// 			zoom = window.innerWidth / style.width;
	// 		} else {
	// 			zoom = window.innerHeight / style.height;
	// 		}

	// 		rootRef.current.style.transform = `scale(${zoom})`;
	// 		rootRef.current.style.transformOrigin = "0 0 0";
	// 		zoomRef.current.style.width = `${style.width * zoom}px`;
	// 		zoomRef.current.style.height = `${style.height * zoom}px`;
	// 	}
	// 	window.addEventListener("resize", handleResize);
	// 	handleResize();
	// 	return () => window.removeEventListener("resize", handleResize);
	// }, [screenStore!.screenInfo]);

	return (
		<div style={{width:"100vw", height:"100vh", overflow:"auto"}}>
			<div
				style={{ width: size.width || "100%", height: size.height || "100%" }}
			>
				{canvasStore.getDetailLoading ? (
					<div
						style={{
							width:"100%",
							height:"100%",
							flex: 1,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Spin />
					</div>
				) : (
					<Viewer onSize={setSize} />
				)}
			</div>
		</div>
	);
}

import { MojitoEvent } from "@/common/eventer";
import { SyncData, syncHelper } from "@/common/syncHelper";
import { DefaulBackgroundColor, DefaultFontColor, PageMode } from "@/config";
import { useMount, useUnmount, useUpdateEffect } from "ahooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCanvasStore } from "../../hook";
import Changer, { ChangerAction } from "../Changer";
import Layer, { LayerAction } from "../Layer";

export default function Viewer({
	mode,
	onSelect,
	onSize,
	layoutRef,
	changerActionRef,
}: {
	mode?: PageMode;
	onSelect?: (
		layer: LayerInfo,
		event?: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => void;
	layoutRef?: React.MutableRefObject<HTMLDivElement | null>;
	changerActionRef?: React.MutableRefObject<ChangerAction | undefined>;
	onSize?: (size:{ width: number, height: number }) => void;
}) {
	const { canvasStore } = useCanvasStore();
	const [scale, setScale] = useState(1);
	const { screenInfo, layers } = canvasStore;
	const pageLayout = screenInfo ? screenInfo.style : undefined;
	const layerActionRefs = useRef<Map<string, LayerAction>>(new Map()).current;

	/**
	 * 组件事件同步回调
	 */
	const syncCallback = useCallback((event: MojitoEvent<SyncData>) => {
		if (event.data) {
			const { to, data } = event.data;
			to.forEach((key) => {
				layerActionRefs.get(key)?.eventSync(data);
			});
		}
	}, []);

	const onRef = useCallback((layerId: string, ref: LayerAction) => {
		layerActionRefs.set(layerId, ref);
	}, []);

	/**
	 * 页面构建完成
	 */
	useMount(() => {
		syncHelper.on("sync", syncCallback);
	});

	/**
	 * 退出编辑时保存数据
	 */
	useUnmount(() => {
		syncHelper.off("sync", syncCallback);
	});

	useEffect(() => {
		if (!pageLayout || mode === PageMode.editor) return;

		if (
			pageLayout.width < window.innerHeight &&
			pageLayout.height < window.innerHeight
		) {
			return;
		}
		let zoom = 1;
		if (pageLayout.width > pageLayout.height) {
			zoom = window.innerWidth / pageLayout.width;
		} else {
			zoom = window.innerHeight / pageLayout.height;
		}
		setScale(zoom);
		if (onSize) {
			onSize({width: pageLayout.width * zoom, height: pageLayout.height * zoom});
		}
	}, [pageLayout, mode]);

	if (!pageLayout) return <div key="pageLayout" />;

	return (
		<div
			key="pageLayout"
			style={{
				...pageLayout,
				backgroundColor: pageLayout.backgroundColor || DefaulBackgroundColor,
				backgroundImage: pageLayout.backgroundImage
					? `url(${pageLayout.backgroundImage})`
					: "none",
				color: pageLayout.color || DefaultFontColor,
				backgroundSize:
					pageLayout.backgroundRepeat === "no-repeat" ? "100% 100%" : undefined,
				backgroundRepeat: pageLayout.backgroundRepeat,
				position: "relative",
				boxShadow:
					mode === PageMode.editor
						? "3px 3px 15px rgb(0 0 0 / 15%)"
						: undefined,
				zIndex: 1,
				overflow: mode === PageMode.editor ? "visible" : "hidden",
				userSelect: "text",
				transform: `scale(${scale})`,
				transformOrigin: mode === PageMode.editor ? "50% 50% 0" : "0 0 0",
			}}
			ref={layoutRef}
		>
			{layers &&
				layers.map((v) => {
					if (!v || !v.component) return null;
					return (
						<Layer
							enable={mode === PageMode.editor}
							data={v}
							key={v.id}
							onRef={onRef}
							onSelected={onSelect}
						/>
					);
				})}
			{mode === PageMode.editor && (
				<Changer changerActionRef={changerActionRef!} />
			)}
		</div>
	);
}

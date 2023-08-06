import classNames from "classnames";
import IconFont from "@/components/IconFont";
import { useGlobalStore } from "@/store";
import { Popover, Tooltip } from "antd";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import ComponentTypeList from "./ComponentTypeList";
import { ComponentList } from "./ComponentList";
import styles from "./index.module.css";
import ComponentLibList from "./ComponentLibList";
import { createFromIconfontCN } from "@ant-design/icons";

type ReducerState = {
	showLibs: boolean;
	showComponent: boolean;
	showCategory: boolean;
};

type ReducerAction =
	| { type: "showLibs"; payload: boolean }
	| { type: "showComponent"; payload: boolean }
	| { type: "showCategory"; payload: boolean };

const listReducer = (sate: ReducerState, action: ReducerAction) => {
	const { type, payload } = action;
	switch (type) {
		case "showLibs":
			return { showComponent: false, showCategory: false, showLibs: payload };
		case "showComponent":
			return { showComponent: payload, showCategory: false, showLibs: false };
		case "showCategory":
			return { showComponent: false, showCategory: payload, showLibs: false };
		default:
			return { showComponent: false, showCategory: false, showLibs: false };
	}
};

export default function LeftSide() {
	const { componentStore } = useGlobalStore();
	// 已选中的类型
	const [currRoot, setCurrRoot] = useState<ComponentTypeTree>();

	const [listState, dispatch] = useReducer<
		Reducer<ReducerState, ReducerAction>
	>(listReducer, {
		showComponent: false,
		showCategory: false,
		showLibs: false,
	});

	const { showComponent, showLibs, showCategory } = listState;

	useEffect(() => {
		componentStore.getTypeTree();
		componentStore.getIconFont();
	}, [componentStore]);

	const UserIconFont = useMemo(() => {
		return componentStore.iconfont?.url
			? createFromIconfontCN({
					scriptUrl: componentStore.iconfont.url,
			})
			: IconFont;
	}, [componentStore.iconfont]);

	useEffect(() => {
		if (!showComponent) {
			setCurrRoot(undefined);
		}
	}, [showComponent]);

	const onCateClick = (category: ComponentTypeTree) => {
		dispatch({
			type: "showComponent",
			payload: category !== currRoot,
		});
		setCurrRoot(category);
	};

	return (
		<aside className={styles.left}>
			<div className={styles.category}>
				<div key="分类管理">
					<Tooltip placement="right" title="分类管理">
						<div
							className={classNames(styles.icon, {
								[styles.iconSelected]: showCategory,
							})}
							onClick={() => {
								dispatch({
									type: "showCategory",
									payload: !showCategory,
								});
							}}
						>
							<IconFont
								type="icon-changyongtubiao_xiangmuzushezhi"
								style={{ color: showCategory ? "#000" : "inherit" }}
							/>
						</div>
					</Tooltip>
				</div>
				<div key="组件库">
					<Tooltip placement="right" title="组件库管理">
						<div
							className={classNames(styles.icon, {
								[styles.iconSelected]: showLibs,
							})}
							onClick={() => {
								dispatch({
									type: "showLibs",
									payload: !showLibs,
								});
							}}
						>
							<IconFont
								type="icon-xitongzujian"
								style={{
									fontSize: "18px",
									color: showLibs ? "#000" : "inherit",
								}}
							/>
						</div>
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
								<UserIconFont type={v.icon ?? "icon-zujian-"} />
							</div>
						</Tooltip>
					);
				})}
				{/* <div
					className={classNames(styles.icon, {
						[styles.iconSelected]: showLibs,
					})}
					style={{
						flex: 1,
						display: "flex",
						alignItems: "end",
						paddingBottom: 12,
					}}
				>
					<IconFont type="icon-shezhi" />
				</div> */}
			</div>
			<ComponentList
				visible={showComponent}
				componentType={currRoot}
				onClose={() => {
					dispatch({
						type: "showComponent",
						payload: false,
					});
				}}
			/>
			<ComponentTypeList
				IconFont={UserIconFont}
				visible={showCategory}
				onClose={() => {
					dispatch({
						type: "showCategory",
						payload: false,
					});
				}}
			/>
			<ComponentLibList
				visible={showLibs}
				onClose={() => {
					dispatch({
						type: "showLibs",
						payload: false,
					});
				}}
			/>
		</aside>
	);
}

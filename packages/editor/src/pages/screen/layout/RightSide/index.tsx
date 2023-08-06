import { Resizable } from "re-resizable";
import EventSetting from "./EventSetting";
import GroupSetting from "./GroupSetting";
import LayerList from "./LayerList";
import PageSetting from "./PageSetting";
import PropsSetting from "./PropsSetting";
import StyleSetting from "./StyleSetting";
import { useCanvasStore } from "../../hook";
import { useMemo, useRef, useState } from "react";
import { Tooltip } from "antd";
import classNames from "classnames";
import IconFont from "@/components/IconFont";
import styles from "./index.module.css";

type AttributeTab = {
	label: string;
	key: string;
	icon: string;
	render: () => JSX.Element;
};

const CompoentSettingKeys = ["style", "props", "event", "anime"];
const Tabs: AttributeTab[] = [
	{
		label: "页面设置",
		key: "page",
		icon: "icon-weixuanzhong",
		render: () => <PageSetting />,
	},
	{
		label: "图层",
		key: "layers",
		icon: "icon-tuceng",
		render: () => <LayerList />,
	},
	{
		label: "图层样式",
		key: "style",
		icon: "icon-css",
		render: () => <StyleSetting />,
	},
	{
		label: "组件属性",
		key: "props",
		icon: "icon-shuxing1",
		render: () => <PropsSetting />,
	},
	{
		label: "交互事件",
		key: "event",
		icon: "icon-dianjishijian",
		render: () => <EventSetting />,
	},
	// {
	//   label: '动画效果',
	//   key: 'anime',
	//   icon: 'icon-donghua',
	//   render: (key?: string) => <Anime key={key} />
	// },
	{
		label: "群组设置",
		key: "group",
		icon: "icon-changyongtubiao_xiangmuzushezhi",
		render: () => <GroupSetting />,
	},
];

const LayerTabs = ["style", "props", "event"];
const GlobalTabs = ["page", "layers"]

export default function RightSide() {
	const { canvasStore } = useCanvasStore();
	const [selectedTab, setSelectedTab] = useState<AttributeTab | undefined>();
	const resizableRef = useRef<Resizable | null>(null)

	const { isGroup, isSelected } = useMemo(() => {
		const val = {
			isGroup: canvasStore.selectedLayers.size > 1,
			isSelected: canvasStore.selectedLayers.size > 0,
		};
		const { isGroup, isSelected } = val;
		if (isGroup && selectedTab && LayerTabs.includes(selectedTab.key)) {
			// 选中多个图层时切换到组编辑
			setSelectedTab(Tabs.find((v) => v.key === "group"));
		} else if (!isSelected && selectedTab && (!GlobalTabs.includes(selectedTab.key))) {
			// 没有选中图层切换到页面编辑
			setSelectedTab(Tabs.find((v) => v.key === "page"));
		} else if (!isGroup && selectedTab && selectedTab.key === "group") {
			// 选中单个图层切换到组件编辑
			setSelectedTab(Tabs.find((v) => v.key === "style"));
		}
		return val;
	}, [canvasStore.selectedLayers, selectedTab]);

	const onTab = (tab: AttributeTab) => {
		if (selectedTab === tab) {
			setSelectedTab(undefined);
			if (resizableRef.current) {
				resizableRef.current.updateSize({ width: 40, height: "100%" })
			}
		} else {
			setSelectedTab(tab);
		}
	};

	return (
		<Resizable
			ref={resizableRef}
			defaultSize={{ width: 40, height: '100%' }}
			minWidth={selectedTab ? 380 : 40}
			maxWidth="70%"
			enable={{
				bottom: false,
				bottomLeft: false,
				bottomRight: false,
				right: false,
				top: false,
				topLeft: false,
				topRight: false,
				left: !!selectedTab
			}}
		>
			<aside className={styles.root}>
				{selectedTab && (
					<div className={styles.content}>{selectedTab.render()}</div>
				)}
				<div className={styles.tabBox}>
					{Tabs.map((v) => {
						if ((isGroup || !isSelected) && CompoentSettingKeys.includes(v.key)) {
							return null;
						} else if (!isGroup && v.key === "group") {
							return null;
						}
						return (
							<Tooltip key={v.key} title={v.label} placement="left">
								<div
									key={v.key}
									className={classNames(styles.tab, {
										[styles.tabSelected]:
											selectedTab && v.key === selectedTab.key,
									})}
									onClick={() => onTab(v)}
								>
									<IconFont type={v.icon} />
								</div>
							</Tooltip>
						);
					})}
				</div>
			</aside>
		</Resizable>
	);
}

import { Resizable } from "re-resizable";
import EventSetting from "./EventSetting";
import GroupSetting from "./GroupSetting";
import LayerList from "./LayerList";
import PageSetting from "./PageSetting";
import PropsSetting from "./PropsSetting";
import StyleSetting from "./StyleSetting";
import { useCanvasStore } from "../../hook";
import { useCallback, useMemo, useState } from "react";
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
		render: (key?: string) => <StyleSetting />,
	},
	{
		label: "组件属性",
		key: "props",
		icon: "icon-shuxing1",
		render: (key?: string) => <PropsSetting />,
	},
	{
		label: "交互事件",
		key: "event",
		icon: "icon-dianjishijian",
		render: (key?: string) => <EventSetting />,
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

export default function RightSide() {
	const { canvasStore } = useCanvasStore();
	const [selectedTab, setSelectedTab] = useState<AttributeTab | undefined>();

  const {isGroup, isSelected, currentLayer} = useMemo(()=>{
    return {
      isGroup: canvasStore.selectedLayers.size > 1,
      isSelected: canvasStore.selectedLayers.size > 0,
      currentLayer: canvasStore.selectedLayers.size === 1 ? Array.from(canvasStore.selectedLayers)[0] : undefined
    }
  }, [canvasStore.selectedLayers]);

	const onTab = (tab: AttributeTab) => {
    if(selectedTab === tab){
      setSelectedTab(undefined);
    }else{
      setSelectedTab(tab);
    }
  };

	return (
		// <Resizable
		//   defaultSize={{ width: 340, height: '100%' }}
		//   minWidth={340}
		//   maxWidth="50%"
		//   enable={{
		//     bottom: false,
		//     bottomLeft: false,
		//     bottomRight: false,
		//     right: false,
		//     top: false,
		//     topLeft: false,
		//     topRight: false,
		//     left: true
		//   }}
		// >
		<aside className={styles.root}>
			{selectedTab && (
				<div className={styles.content}>
					{selectedTab.render()}
				</div>
			)}
			<div className={styles.tabBox}>
				{Tabs.map((v) => {
					if ((isGroup || !isSelected) && CompoentSettingKeys.includes(v.key)) {
						return null;
					}else if (!isGroup && v.key === "group") {
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
		// </Resizable>
	);
}

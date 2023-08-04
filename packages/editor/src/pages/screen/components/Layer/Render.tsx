import { Spin } from "antd";
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount, useUpdateEffect } from "ahooks";
import styles from "./index.module.css";
import { useGlobalStore } from "@/store";

export type ComponentMountEvent = {
	componentProps?: Record<string, any>;
	size?: { width: number; height: number };
	componentOptions?: ComponentOptions;
};

export type RenderAction = {
	reload: () => void;
	updateProps: (data: Record<string, any>) => void;
};

interface RenderProps {
	props?: Record<string, any>;
	events?: Record<string, (...args: any[]) => any>;
	component: ComponentInfo;
	width?: number | string;
	height?: number | string;
	reloadKey?: any;
	onMount?: (event: ComponentMountEvent) => void;
	children?: any;
	style?: React.CSSProperties;
	actionRef?: React.MutableRefObject<RenderAction | undefined>;
	layerId: string;
}

export default function Render({
	component,
	onMount,
	style,
	reloadKey,
	props,
	events,
	layerId,
	actionRef,
}: RenderProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const componentRef = useRef<MojitoComponent | null>(null);
	const shadowRef = useRef<ShadowRoot>();
	const [loading, setLoading] = useState(false);
	const { canvasStore } = useCanvasStore();
	const { screenStore } = useGlobalStore();

	useMount(() => {
		// 创建组件主容器
		const shadow = rootRef.current!.attachShadow({ mode: "open" });
		const componentContainer = document.createElement("div");
		componentContainer.style.width = "100%";
		componentContainer.style.height = "100%";
		shadow.appendChild(componentContainer);
		shadowRef.current = shadow;
		loadComponent();
	});

	const loadComponent = useCallback(() => {
		setLoading(true);

		canvasStore
			.loadComponent(component.packId, component.exportName)
			.then((Component) => {
				const shadowRoot = shadowRef.current;
				if (Component && rootRef.current && shadowRoot) {

					const packInfo = canvasStore.packLoadedMap.get(component.packId) as PackLoadInfo;
					if(packInfo.name && packInfo.version){
						screenStore.addMojitoStyle(`${packInfo.name}@${packInfo.version}`, shadowRoot);
					}

					const comp = new Component();
					componentRef.current = comp;

					const componentContainer = shadowRoot.firstChild as HTMLDivElement;
					const compProps: any = { ...props, ...events };
					comp.mount(componentContainer, compProps, (props) => {
						setLoading(false);
						if (onMount) {
							const firstChild: HTMLElement =
								componentContainer.firstChild as HTMLElement;
							let size: any = undefined;
							if (firstChild && firstChild.getBoundingClientRect) {
								// 获取组件大小
								const { width, height } = firstChild.getBoundingClientRect();
								size = {
									width: Math.round(width / canvasStore.scale),
									height: Math.round(height / canvasStore.scale),
								};
							}
							onMount({
								componentProps: props,
								size,
								componentOptions: comp.componentInfo,
							});
						}
					});
				}
			});
	}, [onMount, canvasStore, screenStore, component, props, events]);

	useImperativeHandle(
		actionRef,
		() => ({
			reload: () => {
				if (componentRef.current) {
					componentRef.current.unmount();
					loadComponent();
				}
			},
			updateProps: (data) => {
				if (componentRef.current) {
					componentRef.current.setProps(data);
				}
			},
		}),
		[loadComponent]
	);

	/**
	 * 重新加载组件
	 */
	useUpdateEffect(() => {
		if (componentRef.current) {
			componentRef.current.unmount();
			loadComponent();
		}
	}, [reloadKey]);

	/**
	 * 更新组件props
	 */
	useUpdateEffect(() => {
		if (componentRef.current) {
			componentRef.current.setProps(props);
		}
	}, [props]);

	/**
	 * 更新组件props
	 */
	useUpdateEffect(() => {
		if (componentRef.current) {
			componentRef.current.setProps(events);
		}
	}, [events]);

	return (
		<ErrorCatch>
			<div className={styles.render}>
				<div
					ref={rootRef}
					style={style}
				></div>
				{loading && (
					<div className={styles.loading}>
						<Spin />
					</div>
				)}
			</div>
		</ErrorCatch>
	);
}

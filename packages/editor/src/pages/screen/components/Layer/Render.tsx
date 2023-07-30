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
		if (!shadowRef.current) return;
		const shadowRoot = shadowRef.current;

		setLoading(true);
		canvasStore
			.loadComponent(component.packId, component.export)
			.then((Component) => {
				if (Component && rootRef.current) {
					const event = new CustomEvent<{ layerId: string }>(
						`mojito-render-${component.packName}@${component.packVersion}`,
						{ detail: { layerId } }
					);
					document.dispatchEvent(event);

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
	}, [onMount, canvasStore, component, props, events]);

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
			<div
				ref={rootRef}
				style={style}
				id={`${component.packName}@${component.packVersion}-${layerId}`}
			>
				{loading && (
					<div className={styles.loading}>
						<Spin />
					</div>
				)}
			</div>
		</ErrorCatch>
	);
}

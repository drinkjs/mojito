import { Spin } from "antd";
import React, { useCallback, useRef, useState } from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount, useUnmount, useUpdateEffect } from "ahooks";
import styles from "./index.module.css";

export type ComponentMountEvent = {
	componentProps?: Record<string, any>;
	size?: { width: number; height: number };
	componentOptions?:ComponentOptions
}

interface RenderProps {
	props: object;
	componentStyle: ComponentStyle;
	events: any;
	component: ComponentInfo;
	componentName: string;
	width?: number | string;
	height?: number | string;
	reloadKey?: any;
	onMount?: (event: ComponentMountEvent) => void;
	children?: any;
	style?: React.CSSProperties;
}

export default function Render({
	component,
	onMount,
	style,
	width,
	height,
	reloadKey,
	props
}: RenderProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const componentRef = useRef<MojitoComponent | null>(null);
	const [loading, setLoading] = useState(false);
	const { canvasStore } = useCanvasStore();

	const loadComponent = useCallback(() => {
		setLoading(true);
		canvasStore
			.loadComponent(component.packId, component.export)
			.then((Component) => {
				if (Component && rootRef.current) {
					const comp = new Component();
					componentRef.current = comp;
					setLoading(false);

					const shadow = rootRef.current.attachShadow({ mode: "open" });
					const componentContainer = document.createElement("div");
					componentContainer.style.width = "100%";
					componentContainer.style.height = "100%";
					shadow.appendChild(componentContainer);

					const compProps:any = {...props};
					if(width !== undefined){
						compProps.width = width;
					}
					if(height !== undefined){
						compProps.height = height
					}

					comp.mount(
						componentContainer,
						compProps,
						(props) => {
							if (onMount) {
								const firstChild: HTMLElement =
									componentContainer.firstChild as HTMLElement;
								let size: any = undefined;
								if (firstChild && firstChild.getBoundingClientRect) {
									const { width, height } = firstChild.getBoundingClientRect();
									size = {
										width: Math.round(width / canvasStore.scale),
										height: Math.round(height / canvasStore.scale),
									};
								}
								onMount({componentProps: props, size, componentOptions: comp.componentInfo});
							}
						}
					);
				}
			});
	}, [width, height, onMount, canvasStore, component, props]);

	useMount(() => {
		loadComponent();
	});

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
	useUpdateEffect(()=>{
		if(componentRef.current){
			componentRef.current.setProps(props);
		}
	}, [props])

	useUpdateEffect(() => {
		if (componentRef.current) {
			componentRef.current.setProps({
				style: {
					width,
					height,
				},
			});
		}
	}, [width, height]);

	return (
		<ErrorCatch>
			<div ref={rootRef} style={style}>
				{loading && (
					<div className={styles.loading}>
						<Spin />
					</div>
				)}
			</div>
		</ErrorCatch>
	);
}

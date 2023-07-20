import { Spin } from "antd";
import React, { useCallback, useRef, useState } from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount, useUnmount, useUpdateEffect } from "ahooks";
import styles from "./index.module.css";

interface RenderProps {
	props: object;
	componentStyle: ComponentStyle;
	events: any;
	component: ComponentInfo;
	componentName: string;
	width?:number|string,
	height?:number|string,
	reloadKey?:any,
	onMount?: (
		componentProps?: Record<string, any>,
		size?: { width: number; height: number }
	) => void;
	children?: any;
	style?: React.CSSProperties;
}

export default function Render({ component, onMount, style, width, height, reloadKey }: RenderProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const componentRef = useRef<MojitoComponent | null>(null);
	const [loading, setLoading] = useState(false);
	const { canvasStore } = useCanvasStore();

	const loadComponent = useCallback(()=>{
		setLoading(true);
		canvasStore
			.loadComponent(component.packId, component.export)
			.then((Component) => {
				if (Component && rootRef.current) {
					const comp = new Component()
					componentRef.current = comp;
					setLoading(false);

					const componentContainer = document.createElement("div");
					componentContainer.style.width = "100%";
					componentContainer.style.height = "100%";
					rootRef.current.appendChild(componentContainer);

					comp.mount(componentContainer, width && height ? {width, height} : undefined, (props) => {
						if (onMount) {
							const firstChild: HTMLElement = componentContainer.firstChild as HTMLElement;
							let size: any = undefined;
							if (firstChild && firstChild.getBoundingClientRect) {
								const { width, height } = firstChild.getBoundingClientRect();
								size = {width: Math.round(width / canvasStore.scale), height: Math.round(height / canvasStore.scale)};
							}
							onMount(props, size);
						}
					});
				}
			});
	}, [width, height, onMount, canvasStore, component])
	
	useMount(() => {
		loadComponent();
	});

	useUpdateEffect(()=>{
		if(componentRef.current){
			componentRef.current.unmount();
			loadComponent();
		}
	}, [reloadKey]);

	useUpdateEffect(()=>{
		if(componentRef.current){
			componentRef.current.setProps({
				style: {
					width,
					height
				}
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

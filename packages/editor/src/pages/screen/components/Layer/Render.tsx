import { Spin } from "antd";
import React, { useRef, useState } from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount, useUpdateEffect } from "ahooks";
import styles from "./index.module.css";

interface RenderProps {
	props: object;
	componentStyle: ComponentStyle;
	events: any;
	component: ComponentInfo;
	componentName: string;
	width?:number|string,
	height?:number|string
	onMount?: (
		componentProps?: Record<string, any>,
		size?: { width: number; height: number }
	) => void;
	children?: any;
	style?: React.CSSProperties;
}

export default function Render({ component, onMount, style, width, height }: RenderProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const componentRef = useRef<MojitoComponent | null>(null);
	const [loading, setLoading] = useState(false);
	const { canvasStore } = useCanvasStore();

	useMount(() => {
		setLoading(true);
		canvasStore
			.loadComponent(component.packId, component.export)
			.then((Component) => {
				if (Component && rootRef.current) {
					const comp = new Component()
					componentRef.current = comp;
					setLoading(false);
					comp.mount(rootRef.current, undefined, (props) => {
						if (onMount) {
							const firstChild: HTMLElement = rootRef.current!.firstChild as HTMLElement;
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
	});

	useUpdateEffect(()=>{
		if(componentRef.current){
			componentRef.current.setProps({
				style: {
					width,
					height
				}
			});
		}
	}, [width, height])

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

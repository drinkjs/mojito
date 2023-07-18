import { ConfigProvider, message, Spin } from "antd";
import React, { useRef, useEffect, useState } from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount } from "ahooks";
import styles from "./index.module.css"

interface RenderProps {
	props: object;
	componentStyle: ComponentStyle;
	events: any;
	component: ComponentInfo;
	componentName: string;
	onInitSize: (width: number, height: number) => void;
	onShow?: () => void;
	children?: any;
	style?: React.CSSProperties;
}

export default function Render({
	onInitSize,
	onShow,
	props,
	componentStyle,
	events,
	component,
	componentName,
	style,
}: RenderProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const componentRef = useRef<MojitoComponent | null>(null);
	const [loading, setLoading] = useState(false);
	const { canvasStore } = useCanvasStore();

	useMount(()=>{
		setLoading(true)
		canvasStore.loadComponent(component.packId, component.export).then((comp)=>{
			if(comp && ref.current){
				setLoading(false);
				componentRef.current = comp;
				comp.mount(ref.current);
			}
		});
	});

	return (
		<ErrorCatch>
			<div ref={ref} style={style}>{loading && <div className={styles.loading}><Spin /></div>}</div>
		</ErrorCatch>
	);
}

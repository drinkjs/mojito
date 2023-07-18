import { ConfigProvider, message } from "antd";
import React, { useRef, useEffect, useState } from "react";

import ErrorCatch from "@/components/ErrorCatch";
import { useCanvasStore } from "../../hook";
import { useMount } from "ahooks";

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
	const componentRef = useRef<MojitoComponent | null>(null)
	const { canvasStore } = useCanvasStore();

	useMount(()=>{
		canvasStore.loadComponent(component.packId, component.export).then((comp)=>{
			if(comp && ref.current){
				componentRef.current = comp;
				comp.mount(ref.current)
			}
		});
	});

	return (
		<ErrorCatch>
			<div ref={ref} style={style}></div>
		</ErrorCatch>
	);
}

import { ConfigProvider, message } from "antd";
import React, { useRef, useEffect, useState } from "react";
import ErrorCatch from "@/components/ErrorCatch";

interface RenderProps {
	props: object;
	styles: ComponentStyle;
	events: any;
	component: any;
	componentName: string;
	developLib: ComponentDevelopLib;
	onInitSize: (width: number, height: number) => void;
	onShow?: () => void;
	children?: any;
	style?: React.CSSProperties;
}

export default function Render({
	onInitSize,
	onShow,
	props,
	styles,
	events,
	component,
	componentName,
	developLib,
	style,
}: RenderProps) {
	const ref = useRef<HTMLDivElement | null>();
	const vueRef = useRef<HTMLDivElement | null>();
	const vueApp = useRef<any>(); // vue 组件对象
	const vueVM = useRef<any>(); // vue 实例
	const [isInit, setIsInit] = useState(false);
	const isVue = developLib === "Vue3" || developLib === "Vue2";

	useEffect(() => {
		setIsInit(true);
		if (onShow) {
			onShow();
		}
		// 返回react组件的内部长宽
		if (developLib === "React") {
			onInitSize(ref!.current!.offsetWidth, ref!.current!.offsetHeight);
		}
		return () => {
			if (vueApp.current) {
				developLib === "Vue2"
					? vueApp.current.$destroy()
					: vueApp.current.unmount(vueRef.current);
			}
		};
	}, []);

	/**
	 * 生成react 组件
	 * @param funComp
	 */
	const createReact = () => {
		try {
			return React.createElement(component, {
				...props,
				...events,
				styles,
			});
		} catch (e) {
			console.error(e);
		}
	};

	/**
	 * 生成vue组件
	 */
	const createVue = () => {
		if (!isInit) return;

		if (developLib === "Vue3") {
			return createVue3();
		}

		const globalAny: any = global;
		const { Vue } = globalAny;
		if (!Vue) {
			message.error(`Vue没定义，请检查组件${componentName}CDN配置`);
			return;
		}

		const { createApp } = Vue;
		if (createApp) {
			message.error(
				`当前Vue版本与组件${componentName}使用版本不一致，你可能在同一页面使用了两个版本的Vue组件`
			);
			return;
		}

		if (vueApp.current) {
			// 更新props
			Object.keys(props).forEach((key) => {
				Vue.set(vueApp.current, key, props[key]);
			});
			Vue.set(vueApp.current, "styles", styles);
			return;
		}

		vueApp.current = new Vue({
			el: vueRef.current,
			data: {
				...props,
				styles,
			},
			mounted() {
				this.$nextTick(() => {
					// 返回vue组件的内部长宽
					onInitSize(this.$el.offsetWidth, this.$el.offsetHeight);
				});
			},
			render(h: any) {
				return h(component, {
					props: {
						...this.$data,
					},
					on: {
						...events,
					},
				});
			},
		});
	};

	/**
	 * 生成vue3组件
	 * @param Vue
	 */
	const createVue3 = () => {
		const globalAny: any = global;
		const { Vue } = globalAny;

		if (!Vue) {
			message.error(`Vue没定义，请检查组件${componentName}CDN配置`);
			return;
		}

		if (vueApp.current && vueVM.current) {
			// 更新props
			Object.keys(props).forEach((key) => {
				vueVM.current.$data[key] = props[key];
			});
			vueVM.current.$data.styles = styles;
			return;
		}

		const { createApp, h } = Vue;
		if (!createApp) {
			message.error(
				`当前Vue版本与组件${componentName}使用版本不一致，你可能在同一页面使用了两个版本的Vue组件`
			);
			return;
		}

		vueApp.current = createApp({
			data() {
				return {
					...props,
					styles,
				};
			},
			mounted() {
				this.$nextTick(() => {
					// 返回vue组件的内部长宽
					onInitSize(this.$el.offsetWidth, this.$el.offsetHeight);
				});
			},
			render() {
				return h(component, { ...this.$data, ...events });
			},
		});
		vueVM.current = vueApp.current.mount(vueRef.current);
	};

	return (
		<div
			ref={(r) => {
				ref.current = r;
			}}
			style={style}
		>
			<ErrorCatch>
				{isVue ? (
					<>
						<div
							ref={(r) => {
								vueRef.current = r;
							}}
						/>
						{createVue()}
					</>
				) : (
					<ConfigProvider prefixCls="ant" iconPrefixCls="anticon">
						{createReact()}
					</ConfigProvider>
				)}
			</ErrorCatch>
		</div>
	);
}

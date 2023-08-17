import { useEffect, useState } from "react";
import { Modal, Form, Input, Cascader, message } from "antd";
import { ModalFuncProps } from "antd/lib/modal";
import { useGlobalStore } from "@/store";

const layout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 18 },
};

interface Props extends ModalFuncProps {
	value?: ComponentPackInfo;
}

export default function AddComponent({
	value,
	onCancel,
	onOk,
	...restProps
}: Props) {
	const { componentStore } = useGlobalStore();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [packInfo, setPackInfo] = useState<ComponentPackInfo>();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getMojitoPack = (url?: string) => {
		if (loading) return;

		setPackInfo(undefined);
		if (url) {
			setLoading(true);
			setPackInfo(undefined);
			fetch(url, {
				method: "GET",
			})
				.then((res) => {
					return res.json();
				})
				.then((data) => {
					if (data && data.components && data.components.length) {
						setPackInfo(data);
					} else {
						message.error("没有可用的组件");
					}
					form.setFieldValue("name", value?.name ?? data?.name);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	};

	/**
	 * 更新时先获取组件库信息
	 */
	useEffect(() => {
		setPackInfo(undefined);
		if (value && value.packJson) {
			getMojitoPack(value.packJson);
		}
	}, [value]);

	const add = () => {
		if (!packInfo || packInfo.components.length === 0) {
			message.error("没有可用的组件");
			return;
		}

		form.validateFields().then((values) => {
			if (packInfo) {
				setLoading(true);

				if (value) {
					componentStore
						.updateComponentLib({
							...packInfo,
							...values,
							id: value.id,
							type: values.type[values.type.length - 1],
						})
						.then((rel) => {
							if (rel) {
								message.success("修改成功");
								if (onOk) onOk();
							}
						})
						.finally(() => {
							setLoading(false);
						});
				} else {
					componentStore
						.addComponentLib({
							...packInfo,
							...values,
							type: values.type[values.type.length - 1],
						})
						.then((rel) => {
							if (rel) {
								message.success("新增成功");
								if (onOk) onOk();
							}
						})
						.finally(() => {
							setLoading(false);
						});
				}
			}
		});
	};

	return (
		<Modal
			title={value ? "编辑组件" : "新增组件"}
			maskClosable={false}
			{...restProps}
			onOk={add}
			onCancel={onCancel}
			destroyOnClose
			confirmLoading={componentStore.addLoading || loading}
			okText="确定"
			cancelText="取消"
		>
			<Form id="addModalForm" {...layout} form={form} preserve={false}>
				<Form.Item
					label="组件库地址"
					name="packJson"
					rules={[{ required: true, message: "此项不能为空" }]}
					initialValue={value?.packJson}
				>
					<Input
						placeholder="mojito-pack.json"
						disabled={!!value}
						onBlur={(e) => getMojitoPack(e.target.value)}
					/>
				</Form.Item>
				<Form.Item
					label="组件库名称"
					name="name"
					initialValue={value?.name}
					rules={[{ required: true, message: "此项不能为空" }, { max: 20 }]}
				>
					<Input disabled placeholder="组件库名称" />
				</Form.Item>
				<Form.Item
					label="组件库类型"
					name="type"
					rules={[{ required: true, message: "此项不能为空" }]}
					initialValue={value?.type ? [value?.type] : undefined}
				>
					<Cascader
						fieldNames={{ label: "name", value: "id" }}
						options={componentStore.typeTree}
						placeholder="请选择组件库类型"
						getPopupContainer={(target) =>
							document.getElementById("addModalForm") || target
						}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}

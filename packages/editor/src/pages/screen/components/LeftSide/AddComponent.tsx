import { useCallback, useState } from "react";
import {
	Modal,
	Form,
	Input,
	Cascader,
	Upload,
	Button,
	Select,
	message,
} from "antd";
import { ModalFuncProps } from "antd/lib/modal";
import { getTreeAllParent } from "@mojito/common/util";
import { useGlobalStore } from "@/store";
import { getPackInfo } from "@/services/component";

const layout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 18 },
};

interface Props extends ModalFuncProps {
	value?: ComponentInfo;
}

export default function AddComponent({value, onCancel, ...restProps}: Props) {
	const { componentStore } = useGlobalStore();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [packInfo, setPackInfo] = useState<ComponentPackInfo>();

	const onOk = () => {
		if (!packInfo || packInfo.components.length === 0) {
			message.error("No Components Export");
			return;
		}

		form.validateFields().then((values) => {
			if (packInfo) {
        setLoading(true);
				componentStore.addComponent({ ...packInfo, ...values, type: values.type[values.type.length - 1] }).then(()=>{
          message.success("新增成功");
          if(onCancel)
            onCancel();
        }).finally(()=>{
          setLoading(false);
        })
			}
		});
	};

	const getMojitoPack = (e: React.FocusEvent<HTMLInputElement>) => {
		if (loading) return;

		const value = e.target.value;
		if (value) {
			setLoading(true);
			setPackInfo(undefined);
			getPackInfo(value)
				.then((data) => {
					if (data?.components.length === 0) {
						message.error("No Components Export");
						return;
					}
					setPackInfo(data);
					form.setFieldValue("name", data?.name);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	};

	return (
		<Modal
			title={value ? "编辑组件" : "新增组件"}
			maskClosable={false}
			{...restProps}
			onOk={onOk}
      onCancel={onCancel}
			destroyOnClose
			confirmLoading={componentStore.addLoading || loading}
			okText="确定"
			cancelText="取消"
		>
			<Form id="addModalForm" {...layout} form={form} preserve={false}>
				<Form.Item
					label="组件库地址"
					name="packUrl"
					rules={[{ required: true, message: "此项不能为空" }]}
				>
					<Input placeholder="mojito-pack.json" onBlur={getMojitoPack} />
				</Form.Item>
				<Form.Item
					label="组件库名称"
					name="name"
					rules={[
						{ required: true, message: "此项不能为空" },
						{ max: 20, message: "20字以内" },
					]}
				>
					<Input placeholder="请输入组件中文名称(20字以内)" />
				</Form.Item>
				<Form.Item
					label="组件库类型"
					name="type"
					rules={[{ required: true, message: "此项不能为空" }]}
					initialValue={
						value && value.type
							? getTreeAllParent(componentStore.typeTree, value.type).map(
									(v) => v.id
							)
							: undefined
					}
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

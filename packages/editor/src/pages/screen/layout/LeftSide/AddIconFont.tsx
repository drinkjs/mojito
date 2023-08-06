import { useGlobalStore } from "@/store";
import { Form, Input, Modal, ModalFuncProps } from "antd";

const layout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 },
};

interface Props extends ModalFuncProps {
	value?: { url?: string; id: string };
}

export default function AddType({ value, onCancel, ...restProps }: Props) {
	const { componentStore } = useGlobalStore();
	const [form] = Form.useForm();

	const onSubmit = () => {
		form.validateFields().then((values) => {
			if (value && value.id) {
				componentStore
					.updateIconFont({ ...values, id: value.id })
					.then((rel) => {
						if (rel && onCancel) onCancel();
					});
			} else {
				componentStore.addIconFont(values.url).then((rel) => {
					if (rel && onCancel) onCancel();
				});
			}
		});
	};

	return (
		<Modal
			{...restProps}
			onCancel={onCancel}
			onOk={onSubmit}
			title="设置图标库"
			destroyOnClose
			// zIndex={9988}
			confirmLoading={componentStore?.addTypeLoading}
		>
			<Form id="addComponentTypes" {...layout} form={form} preserve={false}>
				<Form.Item
					label="IconFont"
					name="url"
					rules={[{ required: !value, message: "此项不能为空" }, { max: 200 }]}
					initialValue={value?.url}
				>
					<Input placeholder="//at.alicdn.com/**/xxx.js" />
				</Form.Item>
			</Form>
		</Modal>
	);
}

import { useGlobalStore } from "@/store";
import { Form, Input, Modal, ModalFuncProps } from "antd";

const layout = {
	labelCol: { span: 6 },
	wrapperCol: { span: 18 },
};

interface Props extends ModalFuncProps {
	value?: ComponentTypeTree;
}

export default function AddType({ value, onCancel, ...restProps }: Props) {
  
  const { componentStore } = useGlobalStore();
  const [form] = Form.useForm();
  
  const onSubmit = ()=>{
    form.validateFields().then((values) => {
			const newValues = {
				...values,
				pid: values.pid ? values.pid[values.pid.length - 1] : undefined,
				id: value ? value.id : undefined,
			};
			if (value && value.id) {
				componentStore.updateType(newValues).then((rel) => {
					if (rel && onCancel) onCancel();
				});
			} else {
				componentStore.addType(newValues).then((rel) => {
					if (rel && onCancel) onCancel();
				});
			}
		});
  }

	return (
		<Modal
			{...restProps}
			onCancel={onCancel}
			onOk={onSubmit}
			title={value ? "编辑分类" : "新增分类"}
			destroyOnClose
			// zIndex={9988}
			confirmLoading={componentStore?.addTypeLoading}
		>
			<Form id="addComponentTypes" {...layout} form={form} preserve={false}>
				<Form.Item
					label="分类名称"
					name="name"
					rules={[{ required: true, message: "此项不能为空" }, { max: 30 }]}
					initialValue={value?.name}
				>
					<Input placeholder="请输入分类名称" />
				</Form.Item>
				{/* <Form.Item
        label="父级类型"
        name="pid"
        rules={[{ required: false, message: "" }]}
        initialValue={parentValue}
      >
        <Cascader
          fieldNames={{ label: "name", value: "id" }}
          options={value ? filterOpts() : componentStore.typeTree}
          placeholder="请选择父级类型"
          getPopupContainer={(target) =>
            document.getElementById("addComponentTypes") || target
          }
          allowClear
          changeOnSelect
        />
      </Form.Item> */}
				<Form.Item
					label="图标"
					name="icon"
					rules={[{ message: "此项不能为空" }]}
					initialValue={value?.icon}
				>
					<Input placeholder="请输入图标" />
				</Form.Item>
			</Form>
		</Modal>
	);
}

import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Form, Input, Cascader, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ModalFuncProps } from 'antd/lib/modal';
import { RcFile } from 'antd/lib/upload';
import UploadImg from 'components/UploadImg';
import { toJS } from 'mobx';
import { getTreeParent } from 'common/util';
import { ComponentInfo, ComponentStore } from 'types';

const { useCallback, useState } = React;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};

interface Props extends ModalFuncProps {
  value?: ComponentInfo;
  componentStore?: ComponentStore;
}

const UploadComp = (props: any) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const { onChange, libId } = props;

  // eslint-disable-next-line no-unused-vars
  const beforeUpload = useCallback((file: RcFile, FileList: RcFile[]) => {
    if (
      file.type === 'application/x-zip-compressed' ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip'
    ) {
      return true;
    }
    message.error('只支持上传zip格式文件');
    setFileList([]);
    onChange(undefined);
    return false;
  }, []);

  const onUpload = useCallback((info) => {
    if (info.fileList.length > 0) {
      setFileList([info.file]);
    } else {
      setFileList([]);
      onChange(undefined);
    }
    if (info.file.status === 'done') {
      //  上传完成
      const { response } = info.file;
      if (response.code === 0) {
        // const {libName, version} = response.data
        // if (props.libName && libName != props.libName) {
        //   message.error("上传组件与原组件的导出名称不一致");
        //   setFileList([]);
        //   onChange(undefined);
        //   return;
        // }
        onChange(response.data);
        // 是否有相同版本的组件
        // getByLibname({libName, version, origin:2}).then((data)=>{
        //   if(!data){
        //     onChange(response.data);
        //   }else{
        //     message.error(`${libName}-${version}已存在`);
        //     setFileList([]);
        //     onChange(undefined);
        //   }
        // })
      } else {
        // 上传失败
        message.error(response.msg);
        setFileList([]);
        onChange(undefined);
      }
    }
  }, []);

  return (
    <Upload
      multiple={false}
      beforeUpload={beforeUpload}
      accept=".zip"
      action="/api/component/upload"
      onChange={onUpload}
      fileList={fileList}
      data={{
        origin: 2,
        libId
      }}
    >
      <Button icon={<UploadOutlined />}>上传组件zip包</Button>
    </Upload>
  );
};

export default inject('componentStore')(
  observer((props: Props) => {
    const { componentStore, value, ...restProps } = props;
    const oldType = value ? value.type : undefined;
    // const [origin, setOrigin] = useState(2);
    const [form] = Form.useForm();

    const onOk = useCallback(() => {
      form.validateFields().then((values) => {
        const submitValue = {
          ...value,
          ...values,
          ...values.componentInfo,
          componentInfo: undefined,
          type: values.type[values.type.length - 1],
          coverImg: values.coverImg || ''
        };

        if (value && value.id) {
          componentStore!.updateComponent(submitValue).then(() => {
            componentStore!.getTypeComponent(oldType);
            message.success('修改成功');
            // 修改完之后重置
            const globalVal: any = global;
            globalVal[value.libName + value.version] = null;
            props.onCancel && props.onCancel();
          });
          return;
        }

        componentStore!.addComponent(submitValue).then(() => {
          if (componentStore!.currSelectType === submitValue.type) {
            componentStore!.getTypeComponent(submitValue.type);
          }
          message.success('新增成功');
          props.onCancel && props.onCancel();
        });
      });
    }, [form, props]);

    const onUploadComp = useCallback(
      (uploadValue: any) => {
        form.setFieldsValue({
          libName: uploadValue
            ? uploadValue.libName
            : value
              ? value.libName
              : undefined,
          title: value
            ? value.title
            : uploadValue
              ? `${uploadValue.libName} ${uploadValue.version}`
              : undefined
        });
      },
      [value]
    );

    return (
      <Modal
        title={value ? '编辑组件' : '新增组件'}
        maskClosable={false}
        {...restProps}
        onOk={onOk}
        destroyOnClose
        confirmLoading={componentStore!.addLoading}
        zIndex={9988}
        okText="确定"
        cancelText="取消"
      >
        <Form id="addModalForm" {...layout} form={form} preserve={false}>
          <Form.Item
            label="上传组件"
            name="componentInfo"
            rules={[{ required: !value, message: '此项不能为空' }]}
          >
            <UploadComp onChange={onUploadComp} libId={value ? value.id : ''} />
          </Form.Item>
          <Form.Item
            label="导出名称"
            name="libName"
            rules={[{ required: true, message: '此项不能为空' }]}
            initialValue={value && value.libName ? value.libName : undefined}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="组件名称"
            name="title"
            rules={[{ required: true, message: '此项不能为空' }]}
            initialValue={value && value.title ? value.title : undefined}
          >
            <Input placeholder="请输入组件中文名称" />
          </Form.Item>
          <Form.Item
            label="组件类型"
            name="type"
            rules={[{ required: true, message: '此项不能为空' }]}
            initialValue={
              value && value.type
                ? getTreeParent(toJS(componentStore!.typeTree), value.type).map(
                  (v) => v.id
                )
                : undefined
            }
          >
            <Cascader
              fieldNames={{ label: 'name', value: 'id' }}
              options={componentStore!.typeTree}
              placeholder="请选择组件类型"
              getPopupContainer={(target) =>
                document.getElementById('addModalForm') || target
              }
            />
          </Form.Item>
          <Form.Item
            label="组件图片"
            name="coverImg"
            rules={[{ required: false }]}
            initialValue={value && value.coverImg ? value.coverImg : undefined}
          >
            <UploadImg />
          </Form.Item>
        </Form>
      </Modal>
    );
  })
);

import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { Modal, Form, Input, Cascader, message } from 'antd'
import { ModalFuncProps } from 'antd/lib/modal'
import { FormOutlined, DeleteOutlined } from '@ant-design/icons'
import Image from 'components/Image'
import UploadImg from 'components/UploadImg'
// import {getByLibname} from "services/component"
import { toJS } from 'mobx'
import { getTreeParent } from 'common/util'
import { ComponentInfo, ComponentStore } from 'types'
import styles from './SysComponents.module.scss'

const { useCallback, useState, useEffect } = React

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const Item = (props: {
  value: ComponentInfo;
  onEdit: (value: ComponentInfo) => void;
  onRemove: (value: ComponentInfo) => void;
}) => {
  const { value, onEdit, onRemove } = props
  return (
    <div className={styles.itemView}>
      <div>
        <Image src={value.coverImg} width="100%" />
      </div>
      <div style={{ textAlign: 'center', padding: '3px 0' }}>{value.title}</div>
      <div className={styles.toolBar}>
        <a
          onClick={() => {
            onEdit(value)
          }}
        >
          <FormOutlined />
        </a>
        <a
          onClick={() => {
            onRemove(value)
          }}
        >
          <DeleteOutlined />
        </a>
      </div>
    </div>
  )
}

interface Props extends ModalFuncProps {
  onSubmit: () => void;
  componentStore?: ComponentStore;
}

export default inject('componentStore')(
  observer((props: Props) => {
    const { componentStore } = props
    const [form] = Form.useForm()
    const [visible, setVisible] = useState(false)
    const [currValue, setCurrValue] = useState<ComponentInfo>()

    useEffect(() => {
      componentStore!.getTypeTree()
      componentStore!.getComponentSystem()
    }, [])

    const onOk = useCallback(() => {
      form.validateFields().then((values) => {
        const submitValue = {
          ...currValue,
          ...values,
          type: values.type[values.type.length - 1]
        }
        componentStore!.addSystemComponent(submitValue).then(() => {
          componentStore!.getComponentSystem()
          onCancel()
          message.success('更新成功')
        })
      })
    }, [form, currValue])

    const onEdit = useCallback((value: ComponentInfo) => {
      setCurrValue(value)
      setVisible(true)
    }, [])

    const onRemove = useCallback((value: ComponentInfo) => {
      Modal.confirm({
        title: `确定删除${value.title}?`,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          componentStore!.removeComponent(value.id).then(() => {
            componentStore!.getComponentSystem()
            onCancel()
            message.success('删除成功')
          })
        }
      })
    }, [])

    const onCancel = useCallback(() => {
      setVisible(false)
      setCurrValue(undefined)
      form.resetFields()
    }, [])

    return (
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {componentStore!.systemComponent.map((v) => {
            return (
              <Item
                value={toJS(v)}
                onEdit={onEdit}
                onRemove={onRemove}
                key={v.id}
              />
            )
          })}
        </div>
        <Modal
          visible={visible}
          title="修改组件"
          onCancel={onCancel}
          onOk={onOk}
          destroyOnClose
        >
          <Form id="addModalForm" {...layout} form={form} preserve={false}>
            <Form.Item
              label="组件类型"
              name="type"
              rules={[{ required: true, message: '请选择组件类型' }]}
              initialValue={
                currValue && currValue.type
                  ? getTreeParent(
                    toJS(componentStore!.typeTree),
                    currValue.type
                  ).map((v) => v.id)
                  : undefined
              }
            >
              <Cascader
                fieldNames={{ label: 'name', value: 'id' }}
                options={componentStore!.typeTree}
                placeholder="请选择组件类型"
                getPopupContainer={(target) => document.getElementById('addModalForm') || target}
              />
            </Form.Item>
            <Form.Item
              label="组件名称"
              name="title"
              rules={[{ required: true, message: '请输入组件名称' }]}
              initialValue={currValue ? currValue.title : undefined}
            >
              <Input placeholder="请输入组件名称" />
            </Form.Item>
            <Form.Item
              label="组件图片"
              name="coverImg"
              rules={[{ required: false }]}
              initialValue={currValue ? currValue.coverImg : undefined}
            >
              <UploadImg />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  })
)

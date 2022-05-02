import { Button, Empty, Popconfirm, Space } from "antd";
import { inject, observer } from "mobx-react";
import React, { useState } from "react";
import { PlusOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons";
import Ellipsis from "components/Ellipsis";
import styles from "./index.module.scss";
import { DatasourceInfo, ScreenStore } from "types";
import DataSourceConnectModal from "./DataSourceConnectModal";
import Message from "components/Message";

interface Props {
  screenStore?: ScreenStore;
}

function DataSourceSet ({ screenStore }: Props) {
  const [showDatasource, setShowDatasource] = useState(false);
  const [editData, setEditData] = useState<DatasourceInfo|undefined>()
  const [saveing, setSaveing] = useState(false);

  const onCancel = () => {
    setShowDatasource(false);
  };

  /**
   * 新增数据源连接
   * @param values
   */
  const onAddDatasource = (values: DatasourceInfo) => {
    setSaveing(true);
    screenStore?.addDatasource(values).then(() => {
      Message.success("新增成功");
      onCancel();
      screenStore?.reload();
    }).finally(() => {
      setSaveing(false)
    })
  }

  const onDel = (id?:string) => {
    if (!id) return;
    screenStore?.delDatasource(id).then(() => {
      Message.success("删除成功");
      screenStore?.reload();
    })
  }

  const onEdit = (data:DatasourceInfo) => {
    setShowDatasource(true)
    setEditData(data)
  }

  return (
    <div className={styles.title}>
      <p>
        数据源
        <Button
          size="small"
          icon={<PlusOutlined />}
          style={{ marginLeft: "6px" }}
          onClick={() => {
            setShowDatasource(true);
          }}
        ></Button>
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column"
        }}
      >
        {screenStore?.screenInfo?.dataSources?.length
          ? (
              screenStore?.screenInfo?.dataSources.map((v) => {
                return (
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
                key={`${v.host}:${v.port}`}
              >
                <div style={{ width: "80%", padding: "3px 0" }}>
                  <Ellipsis lines={1} tooltip>
                    {v.type}://{v.host}:{v.port}@{v.username}
                  </Ellipsis>
                </div>
                <Space>
                  <Button size="small" icon={<FormOutlined />} onClick={() => { onEdit(v) }}></Button>
                  <Popconfirm title="确定删除？" onConfirm={() => { onDel(v.id) }}><Button size="small" icon={<DeleteOutlined />}></Button></Popconfirm>
                </Space>
              </div>
                );
              })
            )
          : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
      </div>
      <DataSourceConnectModal
        visible={showDatasource}
        onCancel={onCancel}
        onSubmit={onAddDatasource}
        confirmLoading={saveing}
        value={editData}
      />
    </div>
  );
}

export default inject("screenStore")(observer(DataSourceSet));

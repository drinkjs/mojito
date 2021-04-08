import React from 'react';
import { Modal } from 'antd';
import IconFont from 'components/IconFont';
import { ProjectDto } from 'types';
import styles from './projectItemList.module.scss';

const classNames = require('classnames');

interface Props {
  value: ProjectDto[];
  onSelect: (data: ProjectDto) => void;
  onEdit: (data: ProjectDto) => void;
  onRemove: (data: ProjectDto) => void;
  selected: string;
}

const projectItemList = (props: Props) => {
  const { value, onSelect, selected, onEdit, onRemove } = props;
  const [modal, contextHolder] = Modal.useModal();

  const handleEdit = (e: React.MouseEvent<any>, data: ProjectDto) => {
    e.stopPropagation();
    onEdit(data);
  };

  const handleRemove = (e: React.MouseEvent<any>, data: ProjectDto) => {
    e.stopPropagation();
    modal.confirm({
      title: `确定删除${data.name}?`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        onRemove(data);
      }
    });
  };

  // const handleCdn = (e: React.MouseEvent<any>, data: ProjectDto) => {
  //   e.stopPropagation();
  //   onCdn(data);
  // };

  return (
    <aside className={styles.myProjectBox}>
      <div className={styles.myProject}>项目列表</div>
      <div className={styles.itemBox}>
        {value.map((v) => {
          return (
            <div
              className={classNames(styles.projectItem, {
                [styles.projectItemSelected]: selected === v.id
              })}
              key={v.name}
              onClick={() => {
                onSelect(v);
              }}
            >
              <div style={{ color: '#eee', fontSize: '18px' }}>{v.name}</div>
              <div style={{ marginTop: '12px' }}>{v.createTime}</div>
              <div className={styles.toolBar}>
                <a
                  onClick={(e) => {
                    handleEdit(e, v);
                  }}
                >
                  <IconFont type="icon-edit-square" />
                </a>
                <a
                  onClick={(e) => {
                    handleRemove(e, v);
                  }}
                >
                  <IconFont type="icon-shanchu1" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
      {contextHolder}
    </aside>
  );
};

export default projectItemList;

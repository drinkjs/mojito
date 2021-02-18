import React from 'react';
import DocumentTitle from 'components/DocumentTitle';
import IconFont from 'components/IconFont';
import Header from './components/Header';
import styles from './ContentLayout.module.scss';

interface Props {
  children?: any;
  header?: any;
  title?: string;
  showBack?: boolean;
  backLink?: string;
}

const ContentLayout = ({
  children,
  header,
  title,
  showBack,
  backLink,
}: Props) => {
  return (
    <DocumentTitle title={title || ''}>
      <div className={styles.root}>
        <Header style={{ borderBottom: '2px solid #000', display: 'flex' }}>
          {showBack && backLink && (
            <span style={{ padding: '0 12px' }}>
              <a href={backLink}>
                <IconFont type="icon-fanhui1" className={styles.backIcon} />
              </a>
            </span>
          )}
          <span>{title}</span>
          <span>{header}</span>
        </Header>
        <div className={styles.content}>{children}</div>
      </div>
    </DocumentTitle>
  );
};

export default ContentLayout;

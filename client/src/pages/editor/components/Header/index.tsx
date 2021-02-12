import * as React from 'react';
import styles from './index.module.scss';

const Header = ({ children, style }: React.HTMLProps<HTMLElement>) => {
  return (
    <header className={styles.header} style={style}>
      {children}
    </header>
  );
};

export default Header;

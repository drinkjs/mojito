/* eslint-disable react/prop-types */
import React from 'react';
// import { renderRoutes } from 'routes';
import { Provider } from 'mobx-react';
import { stores } from 'store';
import styles from './index.module.scss';

const RootLayout = ({ route, children }) => {
  return (
    <Provider {...stores}>
      <div className={styles.layout}>{children}</div>
    </Provider>
  );
};

export default RootLayout;

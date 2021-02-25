/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'mobx-react';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { stores } from 'store';
import styles from './index.module.scss';

const RootLayout = ({ route, children }) => {
  return (
    <Provider {...stores}>
      <div className={styles.layout}>{children}</div>
      <ToastContainer
        position="top-center"
        hideProgressBar
        closeOnClick={false}
        autoClose={3000}
        transition={Flip}
      />
    </Provider>
  );
};

export default RootLayout;

/* eslint-disable react/prop-types */
import React from 'react'
import { renderRoutes } from 'routes'
import { Provider } from 'mobx-react'
import { stores } from 'store'
import styles from './index.module.scss'

const RootLayout = ({ route }) => {
  return (
    <Provider {...stores}>
      <div className={styles.layout}>{renderRoutes(route.routes)}</div>
    </Provider>
  )
}

export default RootLayout

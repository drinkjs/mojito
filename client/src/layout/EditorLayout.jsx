/* eslint-disable react/prop-types */
import { renderRoutes } from 'routes'
import React from 'react'
import styles from './index.module.scss'

const EditorLayout = ({ route }) => {
  return <div className={styles.editor}>{renderRoutes(route.routes)}</div>
}

export default EditorLayout

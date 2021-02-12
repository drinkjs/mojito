import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import Router from './routes'
import './App.css'

function App () {
  return (
    <ConfigProvider locale={zhCN}><Router /></ConfigProvider>
  )
}

export default App

/*
  入口js文件
 */

import React from "react";
import ReactDOM from 'react-dom'

import App from "./App"
import storageUtils from "./utils/storageUtils"
import memoryUtils from "./utils/memoryUtils"

// 读取local中的数据保存到内存中
const user = storageUtils.getUser()
memoryUtils.user = user

// 将App组件渲染到index页面的root标签下
ReactDOM.render(<App/>, document.getElementById('root'))
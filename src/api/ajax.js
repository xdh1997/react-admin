/*
  能够发送异步ajax请求的函数模块
  封装的是axios库
  函数返回的是promise对象
  优化1：统一处理请求异常
    解决方案：先return一个新的promise，那么就可以获取请求到底是失败还是成功，成功的话不做处理，失败的话则处理
  优化2：在组件中不是获取response整个对象，而是获取response.data这个对象
    解决方案：resolve(response.data)
 */

import axios from 'axios'
import {message} from "antd"

export default function ajax(url, data={}, method='GET') {
  console.log('ajax-url', url)
  return new Promise((resolve, reject) => {
    let promise
    // 1. 执行异步请求
    if(method.toUpperCase() === 'GET') {
      promise = axios.get(url, {  // 配置对象，将GET方式的传递过来的参数拼接到url上(查看axios文档即可知道)
        params: data
      })
    } else {
      promise = axios.post(url, data)
    }

    promise.then(response => {  // 2.1. 请求成功，执行resolve函数
      resolve(response.data)
    }).catch(error => {  // 2.2. 请求失败，不是执行reject函数，而是提示异常信息
      message.error('请求失败:' + error.message)
    })
  })
}
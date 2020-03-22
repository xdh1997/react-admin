/*
  应用的根组件
    定义组件的两种方式
      简单的：函数的方式(无状态数据)
      复杂的：类定义方式(有状态数据)
 */

import React from "react"
import {Component} from "react"
import {BrowserRouter, Route, Switch} from 'react-router-dom'

import Login from "./pages/login/login"
import Admin from "./pages/admin/admin"

export default class App extends Component{


  render() {
    return(
      <BrowserRouter>
        <Switch> {/*只匹配其中一个路由*/}
          {/*
            配置路由：
              paht：浏览器访问的时候的路径
              component：指定路由组件
          */}
          <Route path='/login' component={Login}></Route>
          <Route path='/' component={Admin}></Route>
        </Switch>
      </BrowserRouter>
    )
  }
}
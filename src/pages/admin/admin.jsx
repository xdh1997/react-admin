/*
  后台管理界面的路由组件
 */

import React, {Component} from "react"
import { Route, Switch, Redirect} from 'react-router-dom'
import { Layout } from 'antd'

import memoryUtils from "../../utils/memoryUtils"
import LeftNav from "../../components/left-nav"
import Header from "../../components/header"
import Home from "../home/home"
import Category from "../category/category"
import Product from "../product/product"
import User from "../user/user"
import Role from "../role/role"
import Bar from "../charts/bar"
import Line from "../charts/line"
import Pie from "../charts/pie"
import Order from "../order/order"

const { Footer, Sider, Content } = Layout

export default class Admin extends Component{
  render() {
    // 从内存中读取user信息
    const user = memoryUtils.user
    // 判断是否有数据
    if(!user || !user._id) {  // 内存中没有user，则自动跳转到login界面
      // 在render中实现自动跳转
      return <Redirect to="/login" />
    }
    return (
      <Layout style={{minHeight: '100%'}}>
        <Sider>
          <LeftNav/>
        </Sider>
        <Layout>
          <Header>Header</Header>
          <Content style={{backgroundColor: 'white', color: 'black', margin: 25}}>
            <Switch>
              <Route path='/home' component={Home}></Route>
              <Route path='/category' component={Category} />
              <Route path='/product' component={Product} />
              <Route path='/user' component={User} />
              <Route path='/role' component={Role} />
              <Route path='/charts/bar' component={Bar} />
              <Route path='/charts/line' component={Line} />
              <Route path='/charts/pie' component={Pie} />
              <Route path='/order' component={Order} />
              <Redirect to="/home"/>
            </Switch>
          </Content>
          <Footer style={{textAlign: 'center', color: '#bbb'}}>推荐使用谷歌浏览器，可以获得更佳页面操作体验</Footer>
        </Layout>
      </Layout>
    )
  }
}
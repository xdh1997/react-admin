import React, {Component} from "react"
import {Switch, Route, Redirect} from 'react-router-dom'

import ProductHome from "./home"
import ProductDetail from "./detail"
import AddUpdateProduct from "./add-update"
import './index.less'

/*
  商品路由组件
 */
export default class Product extends Component {
  render() {
    return (
      <Switch>
        <Route path='/product' exact component={ProductHome}/>
        <Route path='/product/detail' component={ProductDetail}/>
        <Route path='/product/add-update' component={AddUpdateProduct}/>
        <Redirect to='/product'/>
      </Switch>
    )
  }
}
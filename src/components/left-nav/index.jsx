import React, {Component} from "react"
import {Link, withRouter} from "react-router-dom"
import { Menu, Icon } from 'antd'

import './index.less'
import logo from '../../assets/images/logo.png'
import menuList from '../../config/menuConfig'
import memoryUtils from "../../utils/memoryUtils";

const { SubMenu } = Menu


/*
  左侧导航栏组件
 */
class LeftNav extends Component{

  hasItemAuth = (item) => {
    const {key, isPublic} = item  // 当前item的key和是否公开
    const menus = memoryUtils.user.role.menus  // 当前用户的所有权限
    const username = memoryUtils.user.username
    /*
      1. 如果是admin用户，则由全部权限
      2. home是公开的
      3. 根据menus和key进行显示
      4. 当前用户有子item的权限，则该item也要显示
     */
    if (username === 'admin' || isPublic || menus.indexOf(key) !== -1) {
      return true
    } else if (item.children) {
      return !!item.children.find(item => menus.indexOf(item.key) !== -1)
    } else {
      return false
    }
  }

  /*
    菜单列表不再是写死的，而是根据配置文件menuList动态生成的
      分析配置文件：
        情况1：
          {
            title: '首页', // 菜单标题名称
            key: '/home', // 对应的 path
            icon: 'home', // 图标名称
          }
        对应一级菜单：
          <Menu.Item key="/home">
            <Link to="/home">
              <Icon type="pie-chart" />
              <span>首页</span>
            </Link>
          </Menu.Item>
        情况2：
          {
            title: '图形图表',
            key: '/charts',
            icon: 'area-chart',
            children: []
          }
        对应二级菜单：
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="mail" />
                <span>商品</span>
              </span>
            }
          >
            <Menu.Item></<Menu.Item>
            <Menu.Item></<Menu.Item>
            ......
          </SubMenu>
      设计思路：读取配置文件数据生成标签数据
      技术要点：使用数组的map方法

   */
  getMenuNodes = (menuList) => {
    const path = this.props.location.pathname
    return menuList.map( item => {

      // 判断是该用户否有该item的权限
      if (this.hasItemAuth(item)) {
        if(!item.children) {  // 仅一级菜单
          return (
            <Menu.Item key={item.key}>
              <Link to={item.key}>
                <Icon type={item.icon}/>
                <span>{item.title}</span>
              </Link>
            </Menu.Item>
          )
        } else {  // 二级菜单
          // 查找与当前路径匹配的二级菜单
          if(item.children.find(cItem => cItem.key === path)){
            // 获取二级菜单的父菜单的key --- 在路由显示二级菜单的时候能够将其父菜单打开
            this.openKey = item.key
          }
          return (
            <SubMenu
              key={item.key}
              title={
                <span>
                <Icon type={item.icon} />
                <span>{item.title}</span>
              </span>
              }
            >
              {/*对于childrenz中的继续进行递归调用*/}
              {this.getMenuNodes(item.children)}
            </SubMenu>
          )
        }
      } else {
        return null
      }
    })
  }

  // 在第一次render执行之前，执行一次，为第一次render渲染的数据做预处理
  UNSAFE_componentWillMount() {
    this.menuNodes = this.getMenuNodes(menuList)
  }

  render() {
    // 获取当前路径
    let path = this.props.location.pathname
    console.log('path' + path)

    // 当跳转到'/product/detail'或'product/add-update'页面的时候，将path置为'/product'，从而保证selectKey和<Menu.Item key="/product">一致
    if (path.indexOf('/product') !== -1) {
      path = '/product'
    }

    // 得到需要打开的二级菜单的openKey
    const openKey = this.openKey
    console.log('openKey' + openKey)

    return (
      <div className="left-nav">
        <Link to='/' className="left-nav-header">
          <img src={logo} alt="logo"/>
          <h1>硅谷后台</h1>
        </Link>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[path]}
          defaultOpenKeys={[openKey]}
        >
          {this.menuNodes}

          {/*<Menu.Item key="/home">
            <Link to="/home">
              <Icon type="pie-chart" />
              <span>首页</span>
            </Link>
          </Menu.Item>
          <SubMenu
            key="sub1"
            title={
              <span>
                <Icon type="mail" />
                <span>商品</span>
              </span>
            }
          >
            <Menu.Item key="/category">
              <Link to='/category'>
                <Icon type="mail" />
                <span>品类管理</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/product">
              <Link to='/product'>
                <Icon type="mail" />
                <span>商品管理</span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="/user">
            <Link to="/user">
              <Icon type="pie-chart" />
              <span>用户管理</span>
            </Link>
          </Menu.Item>
          <Menu.Item key="/role">
            <Link to="/role">
              <Icon type="pie-chart" />
              <span>角色管理</span>
            </Link>
          </Menu.Item>
          <SubMenu
            key="sub2"
            title={
              <span>
                <Icon type="mail" />
                <span>图表管理</span>
              </span>
            }
          >
            <Menu.Item key="/charts/bar">
              <Link to='/charts/bar'>
                <Icon type="mail" />
                <span>柱状图</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/charts/line">
              <Link to='/charts/line'>
                <Icon type="mail" />
                <span>折线图</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/charts/pie">
              <Link to='/charts/pie'>
                <Icon type="mail" />
                <span>饼状图</span>
              </Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="/order">
            <Link to="/order">
              <Icon type="pie-chart" />
              <span>订单管理</span>
            </Link>
          </Menu.Item>*/}
        </Menu>
      </div>
    )
  }
}

export default withRouter(LeftNav)
import React, {Component} from "react"
import {withRouter} from 'react-router-dom'
import { Modal } from 'antd'

import './index.less'
import {formateDate} from '../../utils/dateUtils'
import memoryUtils from "../../utils/memoryUtils"
import {reqWeather} from "../../api"
import menuList from "../../config/menuConfig"
import storageUtils from "../../utils/storageUtils"
import LinkButton from "../link-button"

/*
  头部组件
 */
class Header extends Component {
  // 该组件的状态数据
  state = {
    currentTime: formateDate(Date.now()),  // 当前时间
    dayPictureUrl: '',  // 天气图片
    weather: ''  // 天气

  }

  // 更新时间状态
  getCurrentTime = () => {
    this.intervalId = setInterval(() => {
      const currentTime = formateDate(Date.now())
      this.setState({currentTime})
    }, 1000)
  }

  // 获取当前天气
  getWeatherInfo = async () => {
    // 获取数据
    const {dayPictureUrl, weather} = await reqWeather('上饶')
    // 更新状态
    this.setState({dayPictureUrl, weather})
  }

  // 获取title
  getTitie = () => {
    const path = this.props.location.pathname
    let title
    menuList.forEach(item => {
      if (item.key === path) {  // 当前item的key和路径一致，则title就是该item对应的title
        title = item.title
      } else if (item.children){  // 查找有children的对象
        const cItem = item.children.find(cItem => path.indexOf(cItem.key) === 0)  // 对children进行遍历，查找其子对象的key和path一致的(或者版包含的)
        if (cItem) {
          title = cItem.title  // 找到后将其赋值给title
        }
      }
    })
    return title
  }

  // 退出登录
  logout = () => {
    // 显示确认框
    Modal.confirm({
      title: '退出',
      content: '确定退出吗?',
      onOk: () => {
        // 删除local中的user数据
        storageUtils.removeUser()
        // 删除内存中的user数据
        memoryUtils.user = {}

        // 跳转到login页面
        this.props.history.replace('/login')
      },
      onCancel() {},
    })
  }

  /*
    在第一次执行render之后执行一次
    一般在这里执行异步代码：ajax请求，定时器
   */
  componentDidMount() {
    // 执行更新时间的函数
    this.getCurrentTime()
    // 执行获取当前天气的函数
    this.getWeatherInfo()
  }

  componentWillUnmount() {
    // 清除定时器
    clearInterval(this.intervalId)
  }

  render() {
    const {currentTime, dayPictureUrl, weather} = this.state
    const user = memoryUtils.user
    // 取出title，不能放在componentWillMount中，因为这个是要根据不同的路由去重新刷新页面的
    const title = this.getTitie()
    return (
      <div className='header'>
        <div className='header-top'>
          <span>欢迎 {user.username}</span>
          {/*eslint-disable-next-line*/}
          <LinkButton onClick={this.logout}>退出</LinkButton>
        </div>
        <div className='header-bottom'>
          <div className='header-bottom-left'>{title}</div>
          <div className='header-bottom-right'>
            <span>{currentTime}</span>
            <img src={dayPictureUrl} alt="weather"/>
            <span>{weather}</span>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(Header)
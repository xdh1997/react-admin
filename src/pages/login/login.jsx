/*
  登陆的路由组件
 */
import React, {Component} from "react"
import {Redirect} from 'react-router-dom'
import {Form, Input, Button, Icon, message} from 'antd'

import './login.less'
import logn from '../../assets/images/logo.png'
import {reqLogin} from '../../api/index'
import memoryUtils from "../../utils/memoryUtils"
import storageUtils from "../../utils/storageUtils"

class Login extends Component{

  handleSubmit = (event) => {
    // 阻止事件默认行为
    event.preventDefault()
    // 对所有的表单值进行校验
    this.props.form.validateFields(async (err, values) => {
      // 校验成功，values值就是表单数据
      if (!err) {
        const {username, password} = values
        // 登录接口请求函数
        // 方式1：需要.then()和.catch()来指定回调函数的方式
        /*reqLogin(username, password).then(response => {
          console.log('请求成功', response.data)
        }).catch(error => {
          console.log('请求失败', error.message)
        })*/

        // 方式2：使用async和await的方式解决回调地狱
        /*
          作用：简化promise对象的使用，不在使用then()来指定成功/失败的回调函数，以同步编码的方式实现异步流程
          await写在哪：在返回promise对象的表达式的左侧，为的是只获取promise执行成功返回的数据value(response)
          async写在哪：在返回await所在最近的函数的左侧
         */
        /*try {
          const response = await reqLogin(username, password)
          console.log('请求成功', response.data)
        } catch (error) {
          console.log('请求失败', error.message)
        }*/

        // 方式3: ajax中统一处理失败的请求
        const result = await reqLogin(username, password)
        console.log('请求成功', result)
        if(result.status === 0) {  // 登录成功
          message.success('登录成功...')
          // 将user信息保存到内存中
          const user = result.data
          memoryUtils.user = user
          // 将user信息保存到local中
          storageUtils.saveUser(user)
          // 跳转后台管理界面
          this.props.history.replace('/')  // 不需要回退到登录界面，使用replace
        } else {  // 登录失败
          message.error(result.msg)
        }
      } else {
        console.log('校验失败...')
      }
    })
  }

  // 自定义规则对密码进行验证
  validatePwd = (rule, value, callback) => {
    if(!value || value.trim().length === 0) {
      callback('密码必须输入')
    } else if(value.length < 4) {
      callback('密码长度至少为4位')
    } else if(value.length > 12) {
      callback('密码长度至多为12位')
    } else if(!/^[a-zA-Z0-9_]+$/.test(value)) {
      callback('密码必须是英文、数子或下划线组成')
    } else {
      callback()  // 不传参数表示验证通过
    }
  }

  render() {

    // 判断用户是否登录
    const user = memoryUtils.user
    if(user && user._id) {
      return <Redirect to="/login" />
    }

    const form = this.props.form
    const { getFieldDecorator } = form

    return (
      <div className='login'>
        <header className='login-header'>
          {/*不能直接用相对路径引入图片，要使用import的方式*/}
          <img src={logn} alt="logo"/>
          <h1>React项目：后台管理系统</h1>
        </header>
        <section className='login-content'>
          <h2>用户登录</h2>
          <Form className="login-form" onSubmit={this.handleSubmit}>
            <Form.Item>
              {
                getFieldDecorator('username', {  // 填写配置对象
                  // 声明式验证：直接使用别人定义好的规则进行验证
                  rules: [
                    { required: true, whitespace: true, message: '用户名必须输入' },
                    { max: 12, message: '用户名至多12位' },
                    { min: 4, message: '用户名至少4位' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须是英文、数子或下划线组成' }
                  ],
                  initialValue: 'admin'  // 指定初始值
                })(
                  <Input
                    prefix={ <Icon type="user" style={{color: 'rgba(0, 0, 0, .25'}} /> }
                    placeholder="Username"
                  />
                )
              }
            </Form.Item>
            <Form.Item>
              {
                getFieldDecorator('password', {
                  rules: [
                    {validator: this.validatePwd}  // 自定义验证：使用定义的validatePwd方法进行验证
                  ]
                })(
                  <Input
                    prefix={ <Icon type="lock" style={{color: 'rgba(0, 0, 0, .25'}} /> }
                    type="password"
                    placeholder="Password"
                  />
                )
              }
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                登录
              </Button>
            </Form.Item>
          </Form>
        </section>
      </div>
    )
  }
}
/*
  高阶函数

  高阶组件
 */

/*
  包装Form组件生成新的组件：Form(Login)
  新组件会向Form传递一个属性：form，可以通过React开发工具进行查看
 */
const WarpLogin = Form.create()(Login)
export default  WarpLogin
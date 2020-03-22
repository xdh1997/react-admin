import React, {Component} from "react"
import {Form, Input, Select} from 'antd'
import PropTypes from 'prop-types'


const Item = Form.Item
const {Option} = Select

/*
  添加Modal组件
 */
class AddOrUpdateForm extends Component {

  static propTypes = {
    roles: PropTypes.array.isRequired,
    user: PropTypes.object,
    setForm: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    // 将form参数传递给父组件
    this.props.setForm(this.props.form)
  }

  render() {
    const {roles} = this.props
    const user = this.props.user
    const {getFieldDecorator} = this.props.form
    const formItemLayout = {
      labelCol: {span: 4},  // 左侧label宽度
      wrapperCol: {span: 18},  // 右侧包裹的宽度
    }

    return (
      <Form {...formItemLayout}>
        <Item label='用户名：'>
          {
            getFieldDecorator(
              'username',
              {
                initialValue: user.username,
                rules: [
                  {required: true, message: '必须输入用户名称'}
                ]
              }
            )(
              <Input placeholder='请输入用户名称'/>
            )
          }
        </Item>
        {
          user._id ? null : (
            <Item label='密码：'>
              {
                getFieldDecorator(
                  'password',
                  {
                    initialValue: user.password,
                    rules: [
                      {required: true, message: '必须输入密码'}
                    ]
                  }
                )(
                  <Input type='password' placeholder='请输入用户密码'/>
                )
              }
            </Item>
          )
        }
        <Item label='手机号：'>
          {
            getFieldDecorator(
              'phone',
              {
                initialValue: user.phone,
                rules: [
                  {required: true, message: '必须输入用户名称'}
                ]
              }
            )(
              <Input placeholder='请输入手机号'/>
            )
          }
        </Item>
        <Item label='邮箱：'>
          {
            getFieldDecorator(
              'email',
              {
                initialValue: user.email,
                rules: [
                  {required: true, message: '必须输入邮箱'}
                ]
              }
            )(
              <Input placeholder='请输入用户邮箱'/>
            )
          }
        </Item>
        <Item label='角色：'>
          {
            getFieldDecorator(
              'role_id',
              {
                initialValue: user.role_id,
                rules: [
                  {required: true, message: '必须选择用户角色'}
                ]
              }
            )(
              <Select placeholder='请选择用户角色'>
                {
                  roles.map(item => <Option value={item._id} key={item._id}>{item.name}</Option>)
                }
              </Select>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(AddOrUpdateForm)
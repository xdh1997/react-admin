import React, {Component} from "react"
import {Form, Input} from 'antd'
import PropTypes from 'prop-types'
const Item = Form.Item

/*
  添加Modal组件
 */
class AddForm extends Component {

  static propTypes = {
    setForm: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    // 将form参数传递给父组件
    this.props.setForm(this.props.form)
  }

  render() {
    const {getFieldDecorator} = this.props.form

    const formItemLayout = {
      labelCol: {span: 4},  // 左侧label宽度
      wrapperCol: {span: 18},  // 右侧包裹的宽度
    }

    return (
      <Form>
        <Item {...formItemLayout} label='角色名称：'>
          {
            getFieldDecorator(
              'roleName',
              {
                rules: [
                  {required: true, message: '必须输入角色名称'}
                ]
              }
            )(
              <Input placeholder='请输入角色名称'/>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(AddForm)
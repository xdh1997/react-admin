import React, {Component} from "react"
import {Form, Input} from 'antd'
import PropTypes from 'prop-types'

const Item = Form.Item

/*
  更新Modal组件
 */
class UpdateForm extends Component {

  // 接收组件传过来的数据
  static propTypes = {
    categoryName: PropTypes.string.isRequired,
    setForm: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    // 执行函数属性，将子组件的form对象传给父组件
    this.props.setForm(this.props.form)
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {categoryName} = this.props
    return (
      <Form>
        <Item>
          {
            getFieldDecorator(
              'categoryName',
              {
                initialValue: categoryName,
                rules: [
                  {required: true, message: '必须输入分类名称'}
                ]
              }
            )(
              <Input placeholder='请输入分类名称'/>
            )
          }
        </Item>
      </Form>
    )
  }
}

export default Form.create()(UpdateForm)
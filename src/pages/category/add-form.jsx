import React, {Component} from "react"
import {Form, Select, Input} from 'antd'
import PropTypes from 'prop-types'
const Item = Form.Item
const Option = Select.Option

/*
  添加Modal组件
 */
class AddForm extends Component {

  static propTypes = {
    categorys: PropTypes.array.isRequired,
    parentId: PropTypes.string.isRequired,
    setForm: PropTypes.func.isRequired
  }

  UNSAFE_componentWillMount() {
    // 将form参数传递给父组件
    this.props.setForm(this.props.form)
  }

  render() {
    const {getFieldDecorator} = this.props.form
    const {categorys, parentId} = this.props
    return (
      <Form>
        <Item>
          {
            getFieldDecorator(
              'parentId',
              {
                initialValue: parentId
              }
            )(
              <Select>
                <Option value='0'>一级菜单</Option>
                {
                  categorys.map(cItem => <Option value={cItem._id} key={cItem._id}>{cItem.name}</Option>)
                }
              </Select>
            )
          }
        </Item>
        <Item>
          {
            getFieldDecorator(
              'categoryName',
              {
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

export default Form.create()(AddForm)
import React, {Component} from "react"
import PropTypes from 'prop-types'
import {Form, Input, Tree} from "antd"
import menuList from "../../config/menuConfig"

const {Item} = Form
const { TreeNode } = Tree

export default class AuthForm extends Component {
  static propTypes = {
    role: PropTypes.object
  }

  constructor(props) {
    super(props)
    /*不能直接指定role的menus，因为menus是一定的，这样会导致不能选择*/
    const {menus} = this.props.role
    this.state = {
      checkedKeys: menus  // 根据传入的role进行初始化checkedKeys
    }
  }

  // 获取所有的权限(也是菜单项)
  getTreeNodes = (menuList) => {
    return menuList.reduce((pre, item) => {
      pre.push(
        <TreeNode title={item.title} key={item.key} >
          {
            item.children ? this.getTreeNodes(item.children) : null
          }
        </TreeNode>
      )
      return pre
    }, [])
  }

  // 选中某一项，并更新状态
  onCheck = checkedKeys=> {
    this.setState({checkedKeys})
  }

  // 获取最新的选中的menus，以便父组件能够获取
  getNesMenus = () => {
    return this.state.checkedKeys
  }

  UNSAFE_componentWillMount() {
    this.treeNodes = this.getTreeNodes(menuList)
  }

  // 根据新传入的role来更新checkKeys的值
  UNSAFE_componentWillReceiveProps(nextProps) {
    const menus = nextProps.role.menus
    this.setState({checkedKeys: menus})
  }

  render() {
    const {checkedKeys} = this.state
    const {role} = this.props
    const {treeNodes} = this
    const formItemLayout = {
      labelCol: {span: 4},  // 左侧label宽度
      wrapperCol: {span: 18},  // 右侧包裹的宽度
    }

    return (
      <div>
        <Item {...formItemLayout} label='角色名称：'>
          <Input value={role.name} disabled />
        </Item>
        <Tree
          checkable
          defaultExpandAll={true}
          checkedKeys={checkedKeys}
          onCheck={this.onCheck}
        >
          <TreeNode title="平台权限" key="all">
            { treeNodes }
          </TreeNode>
        </Tree>
      </div>
    )
  }
}
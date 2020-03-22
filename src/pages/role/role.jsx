import React, {Component} from "react"
import {Card, Button, Table, Modal, message} from 'antd'

import {PAGE_SIZE} from '../../utils/constantsUtils'
import {reqGetRoles, reqAddRole, reqAuthRole} from "../../api"
import AddForm from "./add-form"
import AuthForm from "./auth-form"
import memoryUtils from "../../utils/memoryUtils"
import {formateDate} from '../../utils/dateUtils'
import storageUtils from "../../utils/storageUtils";

/*
  角色路由组件
 */
export default class Role extends Component {

  state = {
    roles: [],  // 所有角色列表
    role: {},  // 选中的role
    showModalStatus: 0  // 标识是否显示Modal，0：都不显示 1：显示添加Modal 2：显示更新Modal
  }

  constructor(props) {
    super(props)
    this.authRef = React.createRef()
  }

  // 初始化Table的表头数据
  initColumns = () => {

    this.columns = [
      {
        title: '角色名称',
        dataIndex: 'name'
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        render: (create_index) => formateDate(create_index)
      },
      {
        title: '授权时间',
        dataIndex: 'auth_time',
        render: formateDate
      },
      {
        title: '授权人',
        dataIndex: 'auth_name'
      }
    ]
  }

  // Table的onRow属性---> 可以添加监听事件
  onRow = (role) => {
    return {
      onClick: event => {
        this.setState({role})
      }
    }
  }

  // 获取角色列表
  getRoles = async () => {
    const result = await reqGetRoles()
    if (result.status === 0) {
      const roles = result.data
      this.setState({roles})
    }
  }

  // 添加角色
  addRole = () => {
    // 表单验证
    this.form.validateFields(async (error, values) => {
      if (!error) {  // 验证通过

        // 收集数据
        const {roleName} = values
        // 发送请求
        const result = await reqAddRole(roleName)
        // 根据结果进行提示/更新列表
        if (result.status === 0) {
          this.setState({showModalStatus: 0})
          const role = result.data  // 获取响应数据
          this.setState(state => ({  // 更新列表 ===> 不是直接请求全部列表，是在原本的基础上直接添加响应数据的
            roles: [...state.roles, role]
          }))
          message.success('添加角色成功!')
          // 清除输入框数据
          this.form.resetFields()
        } else {
          message.error('添加角色失败!')
          // 清除输入框数据
          this.form.resetFields()
        }
      }
    })
  }

  // 设置角色权限
  authRole = async () => {
    const {role} = this.state
    // 获取最新的menus
    const newMenus = this.authRef.current.getNesMenus()
    role.menus = newMenus
    role.auth_name = memoryUtils.user.username
    role.auth_time = Date.now()
    console.log('role', role)
    // 发送请求
    const result = await reqAuthRole(role)
    // 根据请求结果进行提示和更新
    if (result.status === 0) {
      // 当更新当前用户所在角色的权限，则强制退出重新登录
      if (role._id === memoryUtils.user.role_id) {
        memoryUtils.user = {}
        storageUtils.removeUser()
        this.props.history.replace('/login')
        message.success('当前角色权限已修改,请重新登录!')
      } else {
        message.success('设置角色权限成功!')
        this.setState({
          roles: [...this.state.roles]
        })
      }
    } else {
      message.error('设置角色权限失败!')
    }
    // 关闭Modal
    this.setState({showModalStatus: 0})
  }

  UNSAFE_componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getRoles()
  }

  render() {
    const {roles, role, showModalStatus} = this.state
    const {columns} = this

    const title = (
      <span>
        <Button type='primary' style={{marginRight: 20}} onClick={() => this.setState({showModalStatus: 1})}>创建角色</Button>
        <Button type='primary' disabled={!role._id} onClick={() => this.setState({showModalStatus: 2})}>设置角色权限</Button>
      </span>
    )
    return (
      <Card title={title}>
        <Table
          dataSource={roles}
          columns={columns}
          bordered={true}
          rowKey='_id'
          rowSelection={{
            type: 'radio',
            selectedRowKeys: role._id,
            onSelect: (role) => {  // 选中当前行
              this.setState({role})
            }
          }}
          pagination={{
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true
          }}
          onRow={this.onRow}
        />

        <Modal
          title="创建角色"
          visible={showModalStatus === 1}
          onOk={this.addRole}
          onCancel={() => {
            this.setState({showModalStatus: 0})
            this.form.resetFields()
          }}
        >
          <AddForm setForm={(form) => this.form = form} />
        </Modal>

        <Modal
          title="设置角色权限"
          visible={showModalStatus === 2}
          onOk={this.authRole}
          onCancel={() => {
            this.setState({showModalStatus: 0})
          }}
        >
          <AuthForm role={role} ref={this.authRef}/>
        </Modal>
      </Card>
    )
  }
}
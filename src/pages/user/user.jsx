import React, {Component} from "react"
import {Card, Button, Table, Modal, message} from 'antd'
import {PAGE_SIZE} from "../../utils/constantsUtils"
import AddOrUpdateForm from "./add-update-form"
import {formateDate} from "../../utils/dateUtils"
import LinkButton from "../../components/link-button"
import {reqDeleteUser, reqGetUsers, reqAddOrUpdateUser} from "../../api"

/*
  用户路由组件
 */
export default class User extends Component {
  state = {
    users: [],  // 所有用户列表
    roles: [],  // 所有角色列表
    showModalStatus: 0,  // 0：表示隐藏，1：表示显示
    loading: false
  }

  // 初始化Table的表头
  initColumns = () => {
    this.columns = [
      {
        title: '用户名',
        dataIndex: 'username'
      },
      {
        title: '邮箱',
        dataIndex: 'email'
      },
      {
        title: '电话',
        dataIndex: 'phone'
      },
      {
        title: '注册时间',
        dataIndex: 'create_time',
        render: formateDate
      },
      {
        title: '所属角色',
        dataIndex: 'role_id',
        render: (role_id) => this.roleNames[role_id]
      },
      {
        title: '操作',
        render: (user) => (
          <span>
            <LinkButton onClick={() => this.showUpdateModal(user)}>修改</LinkButton>
            <LinkButton onClick={() => this.deleteUser(user)}>删除</LinkButton>
          </span>
        )
      }
    ]
  }

  // 根据roles初始化一个roleName的对象，这个对象可以根据role_id获取role_name
  initRoleNames = (roles) => {
    const roleNames = roles.reduce((pre, role) => {
      pre[role._id] = role.name
      return pre
    }, {})
    this.roleNames = roleNames
  }

  // 获取所有用户列表
  getUsers = async () => {
    const result = await reqGetUsers()
    if (result.status === 0) {
      const {users, roles} = result.data
      this.initRoleNames(roles)
      this.setState({users, roles})
    }
  }

  // 点击添加按钮，显示该状态下的Modal
  showAddModal = () => {
    this.user = null  // 将user置为空，保证打开添加Modal不受之前打开过的更新Modal的影响
    this.setState({showModalStatus: 1})
  }

  // 点击修改按钮，显示该状态下的Modal
  showUpdateModal = (user) => {
    this.user = user  // 保存user到this中，以便能够识别是更新还是添加
    this.setState({showModalStatus: 1})
  }

  // 添加/更新用户
  addOrUpdateUser = async () => {
    // 收集数据
    const user = this.form.getFieldsValue()
    if (this.user && this.user._id) {
      user._id = this.user._id
    }
    // 清除输入内容
    this.form.resetFields()
    // 发送请求
    const result = await reqAddOrUpdateUser(user)
    if (result.status === 0) {
      // 根据结果进行提示/更新
      message.success(`${this.user._id ? '更新用户成功!' : '添加用户成功!'}`)
      this.getUsers()
      this.setState({showModalStatus: 0})
    } else {
      message.error(`${this.user._id ? '更新用户失败!' : '添加用户失败!'}`)
    }
  }

  // 删除用户
  deleteUser = (user) => {
    Modal.confirm({
      title: '确定删除该用户?',
      onOk: async () => {
        const userId = user._id
        const result = await reqDeleteUser(userId)
        if (result.status === 0) {
          message.success('删除用户成功')
          this.getUsers()
        }
      }
    })
  }

  // 关闭Modal
  closeModal = () => {
    this.setState({showModalStatus: 0})
    this.form.resetFields()
  }

  UNSAFE_componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getUsers()
  }

  render() {
    const {users, roles, showModalStatus, loading} = this.state
    const {columns} = this
    const user = this.user || {}
    const title = <Button type='primary' onClick={this.showAddModal}>创建用户</Button>
    return (
      <Card title={title}>
        <Table
          dataSource={users}
          columns={columns}
          bordered={true}
          rowKey='_id'
          loading={loading}
          pagination={{
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true
          }}
        />

        <Modal
          title={user._id ? '修改用户' : '添加用户'}
          visible={showModalStatus === 1}
          onOk={this.addOrUpdateUser}
          onCancel={this.closeModal}
        >
          {/*使用组件，而不是直接写在这里*/}
          <AddOrUpdateForm
            roles={roles}
            user={user}
            setForm={(form) => this.form = form}
          />
        </Modal>
      </Card>
    )
  }
}
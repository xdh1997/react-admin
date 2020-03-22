import React, {Component} from "react"
import {Card, Table, Button, Icon, message, Modal} from 'antd'

import LinkButton from "../../components/link-button"
import {reqAddCategory, reqCategorys, reqUpdateCategory} from "../../api"
import AddForm from "./add-form"
import UpdateForm from "./update-form"
import {PAGE_SIZE} from "../../utils/constantsUtils"


/*
  商品种类路由组件
 */
export default class Category extends Component {

  state = {
    categorys: [],  // 一级分类列表
    subCategorys: [],  // 二级分类列表
    loading: false, // 是否显示加载提示，默认是false
    parentId: '0',  // 页面最开始发送请求获取一级列表(parentId=0)，查看子分类列表获取二级分类(parentId=_id)
    parentName: '',  // 页面最开始显示一级分类列表，查看子分类列表则获取子分类列表名字
    showModalStatus: 0  // 标识是否显示Modal，0：都不显示 1：显示添加Modal 2：显示更新Modal
  }

  // 初始化Table的列数组
  initTableColumns = () => {
    this.columns = [  // 指定Table的表头的列向显示内容
      {
        title: '分类的名称',
        dataIndex: 'name'
      },
      {
        title: '操作',
        width: 400,
        render: (category) => (  /*render会有一行对应哪个category*/
          <span>
            <LinkButton style={{marginRight: 30}} onClick={() => this.showUpdateModal(category)}>修改分类</LinkButton>
            {this.state.parentId === '0' ? <LinkButton onClick={() => this.showSubCategorys(category)}>查看子分类</LinkButton> : null }
          </span>
        )
      }
    ]
  }

  // 获取一级/二级分类列表
  getCategory = async (parentId) => {
    parentId = parentId || this.state.parentId

    // 更新loading的状态 ---> true
    this.setState({loading: true})
    // 发送请求，获取数据
    const result = await reqCategorys(parentId)

    // 更新loading的状态 ---> false
    this.setState({loading: false})

    // 判断是否获取成功
    if (result.status === 0) {
      // 更新状态：可能是一级分类列表也可能是二级分类列表
      if (parentId === '0') {  // 一级分类列表
        const categorys = result.data
        this.setState({categorys})
      } else {  // 二级分类列表
        const subCategorys = result.data
        this.setState({subCategorys})
      }
    } else {
      message.error('获取商品列表失败')
    }
  }

  // 显示一级分类列表(是在点击了一级分类列表这个LinkButton的时候触发的)
  showCategorys = () => {
    // 将有关二级分类的数据置空即可
    this.setState({
      subCategorys: [],
      parentId: '0',
      parentName: ''
    })
  }

  // 显示二级分类列表
  showSubCategorys = (category) => {
    // 获取点击的那个category对象的_id和name
    const parentId = category._id
    const parentName = category.name
    // 更新状态
    this.setState({parentId, parentName}, () => {  // 因为setState是异步的，那么在更新状态代码后直接发送请求是不可以，要在他的回调函数中发送请求
      // 发送请求获取二级列表数据
      this.getCategory()
    })
  }

  // 关闭模态框
  closeModal = () => {
    // 清除form数据
    this.form.resetFields()
    // 更新状态
    this.setState({showModalStatus: 0})
  }

  // 显示添加Modal
  showAddModal = () => {
    this.setState({showModalStatus: 1})
  }

  // 显示更新Modal
  showUpdateModal = (category) => {
    // 保存当前要修改商品分类当this中
    this.category = category
    // 更新状态
    this.setState({showModalStatus: 2})
  }

  // 添加分类
  addCategory = () => {
    // 预处理 ---> 表单验证
    this.form.validateFields(async (err, values) => {
      if (!err) {
        // 1. 隐藏更新Modal
        this.setState({showModalStatus: 0})

        // 2. 发送请求添加分类
        // 2.1. 准备数据
        const {parentId, categoryName} = this.form.getFieldsValue()  // 这个parentId要从子组件中获取，因为有可能不是给当前分类添加，而是要根据他选的那个Options的value值去添加的
        console.log('添加的数据', parentId, categoryName)

        // 2.2. 清除form数据
        this.form.resetFields()

        // 2.3. 发送请求
        const result = await reqAddCategory({parentId, categoryName})
        if(result.status === 0) {
          // 3. 重新获取列表
          /*
            优化：何时需要重新发送请求
              1. 当添加的分类就是当前分类列表下的分类，如：在一级分类下添加一个一级分类列表，在运动下添加一个运动的分类列表(添加的是电器的分类列表则不发请求)
           */
          if (parentId === this.state.parentId) {
            this.getCategory()
          } else if (parentId === '0') {  // 在二级分类列表中添加一级分类商品，重新获取列表数据，但是不需要显示一级列表
            /*
              解决方案：
                给getCategory()方法设置一个参数parentId，当parentId有值时则使用该值，没有的话则使用state中的parentId
                修改getCategory()方法中parentId获取的方式：parentId = parentId || this.state.parentId
                这样的话，在这里传递'0'过去，依旧能重新获取列表数据，但是并未改变state中parentId的值
                所以在render中不会去重新渲染页面
             */
            this.getCategory('0')
          }
        } else {
          message.error('添加失败')
        }
      } else {
        message.error('请输入分类名称')
      }
    })
  }

  // 更新分类名称
  updateCategory = () => {
    // 预处理 ---> 表单验证
    this.form.validateFields( async (err, values) => {
      if (!err) {

        // 1. 隐藏更新Modal
        this.setState({showModalStatus: 0})

        // 2. 发送请求更新分类名称
        // 2.1. 准备数据
        const categoryId = this.category._id  // 从存到this中的当前商品分类对象中获取_id
        /*
          从子组件UpdateForm中获取修改后的categoryName：
          方式：
            在该父组件中使用UpdateForm子组件的地方，定义一个函数属性，需要的参数为form
            在子组件中执行该函数属性，传入子组件的form属性
            在父组件中接收子组件传递过来的form参数，存入this对象中
         */
        const categoryName = this.form.getFieldValue('categoryName')

        // 2.2. 清除form中的数据，解决Input输入框的bug
        this.form.resetFields()

        // 2.3. 发送请求
        const result = await reqUpdateCategory({categoryId, categoryName})
        if (result.status === 0) {
          // 3. 重新显示分类列表
          this.getCategory()
        } else {
          message.error('修改失败')
        }
      } else {
        message.error('请输入分类名称')
      }
    })
  }

  UNSAFE_componentWillMount() {
    this.initTableColumns()
  }

  componentDidMount() {
    // 页面初始化时获取一级分类列表，在点击查看子分类时获取二级分类列表
    this.getCategory()
  }

  render() {
    // 读取state中的状态数据
    const {categorys, subCategorys, loading, parentId, parentName, showModalStatus} = this.state

    // 获取当前分类(showUpdateModal中存进去的数据)
    const category = this.category || {}  // 在render中使用的时候：第一次render的时候并未点击按钮，所以先赋值为{}

    // Card上部左侧显示内容(动态文本)
    const title = parentId === '0' ? '一级分类列表' : (
      <span>
        <LinkButton onClick={this.showCategorys}>一级分类列表</LinkButton>
        <Icon type='arrow-right' style={{marginRight: 10}}></Icon>
        <span>{parentName}</span>
      </span>
    )

    // Card上部右侧显示内容(按钮)
    const extra = (
      <Button
        type='primary'
        onClick={this.showAddModal}
      >
        <Icon type='plus'></Icon>
        添加
      </Button>
    )

    return (
      <Card title={title} extra={extra}>
        <Table
          dataSource={parentId === '0' ? categorys : subCategorys}
          columns={this.columns}
          bordered={true}
          rowKey='_id'
          loading={loading}
          pagination={{
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true
          }}
        />

        <Modal
          title="添加分类"
          visible={showModalStatus === 1}
          onOk={this.addCategory}
          onCancel={this.closeModal}
        >
          {/*使用组件，而不是直接写在这里*/}
          <AddForm
            categorys={categorys}
            parentId={parentId}
            setForm={(form) => this.form = form}
          />
        </Modal>

        <Modal
          title="修改分类名称"
          visible={showModalStatus === 2}
          onOk={this.updateCategory}
          onCancel={this.closeModal}
        >
          <UpdateForm categoryName={category.name} setForm={(form) => this.form = form}/>
        </Modal>

      </Card>


    )
  }
}
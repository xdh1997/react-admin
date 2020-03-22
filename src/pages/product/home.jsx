import React, {Component} from "react"
import {Card, Table, Select, Icon, Input, Button, message} from 'antd'

import LinkButton from "../../components/link-button"
import {reqProducts, reqSearchProducts, reqUpdateStatus} from "../../api"
import {PAGE_SIZE} from "../../utils/constantsUtils"

const Option = Select.Option

export default class ProductHome extends Component {

  state = {
    products: [],
    total: 0,
    loading: false,
    searchType: 'productName',
    searchName: ''
  }

  // 初始化Table的列
  initTableColumns = () => {
    this.columns = [
      {
        title: '商品名称',
        dataIndex: 'name',
      },
      {
        title: '商品描述',
        dataIndex: 'desc',
      },
      {
        title: '商品价格',
        dataIndex: 'price',
        render: (price) => '￥' + price
      },
      {
        title: '商品状态',
        render: (product) => {
          const {_id, status} = product
          return (
            <span>
              <Button type='primary' onClick={() => this.updateStatus(_id, status === 1 ? 2 : 1)} >{status === 1 ? '下架' : '上架'}</Button>
              <span style={{margin: '0 10px'}}>{status === 1 ? '在售' : '已下架'}</span>
            </span>
          )
        }
      },
      {
        title: '操作商品',
        render: (product) => {
          return (
            <span>
              <LinkButton onClick={() => this.props.history.push('/product/detail', {product})}>详情</LinkButton>
              {/*这里直接传递product就行，不要使用对象的方式，如果使用对象的方式在add-update页面就不好获取*/}
              <LinkButton onClick={() => this.props.history.push('/product/add-update', product)}>更新</LinkButton>
            </span>
          )
        }
      }
    ];
  }

  // 获取指定页码的商品分页列表(根据搜素获取/不根据搜索获取)
  getProducts = async (pageNum) => {
    // 保存当前请求的页码
    this.pageNum = pageNum
    // 请求前处理
    this.setState({loading: true})  // 修改loading状态为true
    const pageSize = PAGE_SIZE  // 读取常量
    const {searchType, searchName} = this.state
    // 存储响应结果
    let result
    // 发送请求
    if (searchName) {  // 如果关键字有值则进行搜索获取分页列表
      result = await reqSearchProducts({pageNum, pageSize, searchType, searchName})
    } else {  // 如果关键字没有值则进行一般获取分页列表
      result = await reqProducts({pageNum, pageSize})
    }
    // 响应后处理
    this.setState({loading: false})  // 修改loading状态为false
    this.setState({searchName: ''})
    if (result.status === 0) {
      const products = result.data.list
      const total = result.data.total
      this.setState({products, total})
    } else {
      message.error('获取失败')
    }
  }

  // 更新商品的状态：productId：商品的id，status：商品新的状态
  updateStatus = async (productId, status) => {
    const result = await reqUpdateStatus({productId, status})
    if (result.status === 0) {
      // 更新列表
      this.getProducts(this.pageNum)
      message.success('更新商品成功')
    }
  }

  UNSAFE_componentWillMount() {
    this.initTableColumns()
  }

  componentDidMount() {
    this.getProducts(1)
  }

  render() {
    // 取出数据
    const {products, total, loading, searchName, searchType} = this.state

    // Card头部左侧
    const title = (
      <span>
        <Select
          value={searchType}
          onChange={value => this.setState({searchType: value})}
        >
          <Option value='productName'>按名称搜索</Option>
          <Option value='productDesc'>按描述搜索</Option>
        </Select>
        <Input
          placeholder='关键字'
          value={searchName}
          style={{width: 200, margin: '0 10px'}}
          onChange={event => this.setState({searchName: event.target.value})}
        />
        <Button style={{backgroundColor: '#21a511', color:'white'}} onClick={() => this.getProducts(1)}>搜索</Button>
      </span>
    )

    // Card头部右侧
    const extra = (
      <span>
        <Button type='primary' onClick={() => this.props.history.push('/product/add-update')}>
          <Icon type='plus'></Icon>
          添加商品
        </Button>
      </span>
    )

    return (
      <Card title={title} extra={extra}>
        <Table
          rowKey='_id'
          bordered
          loading={loading}
          dataSource={products}
          columns={this.columns}
          pagination={{
            current: this.pageNum,
            total,
            defaultPageSize: PAGE_SIZE,
            showQuickJumper: true,
            /*onChange: (pageNum) => {this.getProducts(pageNum)}*/
            onChange: this.getProducts
          }}
        />
      </Card>
    )
  }
}
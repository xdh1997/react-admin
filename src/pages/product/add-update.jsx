import React, {Component} from "react"
import {Card, Form, Input, Icon, Cascader, Button, message} from 'antd'
import LinkButton from "../../components/link-button"
import {reqCategorys, reqAddUpdateProduct} from "../../api"
import PicturesWall from "./pictures-wall"
import RichTextEditor from "./rich-text-editor"

const Item = Form.Item
const TextArea = Input.TextArea

class AddUpdateProduct extends Component {

  state = {
    options: [],
    // imgList: []
  }
  
  constructor(props) {
    super(props)
    // 创建一个用于保存ref标示的容器，并将该容器保存到this中
    this.pwRef = React.createRef()
    this.detailRef = React.createRef()
  }

  // 根据获取到的一级列表数据，构建出Cascader组件的options需要的数据结构
  initOptions = async (categorys) => {
    /*// 数据结构
    {
      value: 'jiangsu',
        label: 'Jiangsu',
      isLeaf: false,
    }*/
    const options = categorys.map(item => ({
      value: item._id,
      label: item.name,
      isLeaf: false
    }))

    // 如果是此时进入的页面是二级分类商品的更新 ---> 还要获取对应的二级分类列表
    const {isUpdate, product} = this
    const {pCategoryId} = product
    if (isUpdate && pCategoryId !== '0') {
      // 获取对应的二级分类列表
      const subCategorys = await this.getCategorys(pCategoryId)
      // 找到此时的一级列表
      const targetOption = options.find(item => item.value === pCategoryId)
      // 生成对应的二级列表
      const children = subCategorys.map(item => ({
        value: item._id,
        label: item.name,
        isLeaf: true
      }))
      // 给targetOption.children赋值
      targetOption.children = children
    }

    // 更新options的状态
    this.setState({options})
  }

  // 获取一级/二级商品分类列表
  getCategorys = async (parentId) => {
    const result  = await reqCategorys(parentId)
    if (result.status === 0) {
      const categorys = result.data
      if (parentId === '0') {  // 表示此时要获取的时一级分类列表
        // 根据获取到的一级列表数据，构建出Cascader组件的options需要的数据结构
        this.initOptions(categorys)
      } else {  // 获取一级分类列表中某一项的二级分类列表
        // 要将获取到的数据返回，在执行该函数的地方对返回的数据做处理(类似于初始化options那样，给选中项构建数据结构)
        return categorys
      }
    }
  }

  // 会加载第一级列表中的某一项的子列表(没有则不显示)
  loadData = async selectedOptions => {
    const targetOption = selectedOptions[0]  // 选中的那一项
    targetOption.loading = true

    // 异步获取选中的分类的子列表(商品的二级分类列表)
    const subCategorys = await this.getCategorys(targetOption.value)
    targetOption.loading = false

    if (subCategorys && subCategorys.length > 0) {  // 表示数据不为空，即存在二级分类列表
      // 构建targetOption.children
      const children = subCategorys.map( item => ({
        value: item._id,
        label: item.name,
        isLeaf: true
      }))
      // 给targetOption.children赋值
      targetOption.children = children
      // 更新options的状态
      this.setState({
        options: [...this.state.options],  // 需要使用三点运算符去解构
      })
    } else {  // 不存在二级分类列表
      targetOption.isLeaf = true
    }
  }

  // 自定义价格的验证器
  validatorPrice = (rule, value, callback) => {
    if (value*1 > 0) {  // 验证通过
      callback()
    } else {  // 验证失败
      callback('价格必须大于0')
    }
  }

  // 提交表单，若通过验证，则发送请求
  submit = () => {
    // 表单验证
    this.props.form.validateFields( async (error, values) => {
      if (!error) {
        // 收集数据并封装为product对象
        const {name, desc, price, categoryIds} = values
        let categoryId, pCategoryId
        if (categoryIds.length === 1) {  // 一级分类下的商品
          pCategoryId = '0'
          categoryId = categoryIds[0]
        } else {
          pCategoryId = categoryIds[0]
          categoryId = categoryIds[1]
        }
        const imgs = this.pwRef.current.getImgList()
        const detail = this.detailRef.current.getDetail()
        const product = {name, desc, price, pCategoryId, categoryId, imgs, detail}
        if (this.isUpdate) {  // 如果是更新，还需要添加_id
          product._id = this.product._id
        }

        // 发送请求
        const result = await reqAddUpdateProduct(product)

        if (result.status === 0) {
          message.success(`${this.isUpdate ? '更新商品成功!' : '添加商品成功!'}`)
          this.props.history.goBack()
        } else {
          message.error(`${this.isUpdate ? '更新商品失败!' : '添加商品失败!'}`)
        }
      }
    })
  }

  UNSAFE_componentWillMount() {
    // 获取product：如果是添加则没有值
    const product = this.props.location.state
    // 保存是否进行更新页面的标识
    this.isUpdate = !!product  // 根据product是否为空设置isUpdate的值
    // 保存product
    this.product = product || {}  // 没有的话则保存为空对象
  }

  componentDidMount() {
    // 页面初始化时：获取商品一级分类列表
    this.getCategorys('0')
  }

  render() {
    const {options} = this.state
    const {isUpdate, product} = this
    const {categoryId, pCategoryId, imgs, detail} = product

    // 定义一个空数组用于存放商品分类的initialValue
    const categoryIds = []
    if (isUpdate) {  // 如果是更新页面则将商品的分类数据进行显示
      // 如果谁一级分类
      if (pCategoryId === '0') {
        categoryIds.push(categoryId)
      } else {  // 如果是二级分类
        categoryIds.push(pCategoryId)
        categoryIds.push(categoryId)
      }
    }


    const title = (
      <span>
        <LinkButton onClick={() => this.props.history.goBack()}>
          <Icon type='arrow-left' style={{fontSize: 20, marginRight: 10}} />
        </LinkButton>
        <span>{isUpdate ? '更新商品' : '添加商品'}</span>
      </span>
    )

    const formItemLayout = {
      labelCol: {span: 2},  // 左侧label宽度
      wrapperCol: {span: 6},  // 右侧包裹的宽度
    }

    // 获取form中getFieldDecorator
    const {getFieldDecorator} = this.props.form


    return (
      <Card title={title}>
        <Form {...formItemLayout} >
          <Item label='商品名称:'>
            {
              getFieldDecorator(
                'name',
                {
                  initialValue: product.name,
                  rules: [
                    {required: true, message: '必须输入商品名称'}
                  ]
                }
              )(<Input placeholder='请输入商品名称' />)
            }
          </Item>
          <Item label='商品描述:'>
            {
              getFieldDecorator(
                'desc',
                {
                  initialValue: product.desc,
                  rules: [
                    {required: true, message: '必须输入商品描述'}
                  ]
                }
              )(<TextArea placeholder='请输入商品描述' />)
            }
          </Item>
          <Item label='商品价格:'>
              {
                getFieldDecorator(
                  'price',
                  {
                    initialValue: product.price,
                    rules: [
                      {required: true, message: '必须输入商品价格'},
                      {validator: this.validatorPrice}
                    ]
                  }
                )(<Input type='number' placeholder='请输入商品价格' addonAfter='元' />)
              }
          </Item>
          <Item label='商品分类:'>
            {
              getFieldDecorator(
                'categoryIds',
                {
                  initialValue: categoryIds,
                  rules: [
                    {required: true, message: '必须选择商品分类'}
                  ]
                }
              )(
                <Cascader
                  placeholder='请选择商品分类'
                  options={options}  /*需要显示的列表数据数组*/
                  loadData={this.loadData}  /*当点击options中的某一项时，会加载该项的子列表(没有则不显示)*/
                />
              )
            }
          </Item>
          <Item label='商品图片:'>
            {/*<PicturesWall getImgList={(imgList) =>this.setState({imgList})}/>*/}
            <PicturesWall ref={this.pwRef} imgs={imgs}/>
          </Item>
          <Item label='商品详情:' labelCol={{span: 2}} wrapperCol={{span: 12}}>
            <RichTextEditor ref={this.detailRef} detail={detail}/>
          </Item>
          <Item>
            <Button type='primary' onClick={this.submit}>提交</Button>
          </Item>
        </Form>
      </Card>
    )
  }
}

// 使其props中有form对象
export default Form.create()(AddUpdateProduct)
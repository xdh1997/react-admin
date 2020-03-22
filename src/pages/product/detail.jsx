import React, {Component} from "react"
import {Card, List, Icon} from 'antd'

import {BASE_IMG_URL, PRIMARY_COLOR} from "../../utils/constantsUtils"
import LinkButton from "../../components/link-button"
import {reqCategoryName} from "../../api"

const Item = List.Item

export default class ProductDetail extends Component {
  state = {
    cName1: '',  // 一级分类列名称
    cName2: '',  // 二级分类列名称
  }

  // 根据商品的categoryId和pCategoryId获取对应的分类名称
  getCName = async () => {
    const {categoryId, pCategoryId} = this.props.location.state.product
    if (pCategoryId === '0') {  // 父分类为为0，表示是一级分类下的商品(即户外运动-xxx)
      const result = await reqCategoryName(categoryId)
      const cName1 = result.data.name
      this.setState({cName1})
    } else {  // 表示是二级分类下的商品(即户外运动-跑步鞋-xxx)
      const results = await Promise.all([reqCategoryName(pCategoryId), reqCategoryName(categoryId)])
      const cName1 = results[0].data.name
      const cName2 = results[1].data.name
      this.setState({cName1, cName2})
    }

  }

  componentDidMount() {
    this.getCName()
  }

  render() {

    // 读取路由传递过来的数据
    const {name, desc, price, imgs, detail} = this.props.location.state.product
    const {cName1, cName2} = this.state

    const title = (
      <span>
        <LinkButton onClick={() => this.props.history.goBack()}>
          <Icon type='arrow-left' style={{marginRight: 10, color: PRIMARY_COLOR, fontSize: 20, cursor: "pointer"}}></Icon>
        </LinkButton>
        商品详情
      </span>
    )
    return (
     <Card className='product-detail' title={title}>
        <List>
          <Item className='item'>
            <span className='left'>商品名称:</span>
            <span>{name}</span>
          </Item>
          <Item className='item'>
            <span className='left'>商品描述:</span>
            <span>{desc}</span>
          </Item>
          <Item className='item'>
            <span className='left'>商品价格:</span>
            <span>{price}元</span>
          </Item>
          <Item className='item'>
            <span className='left'>所属分类:</span>
            <span>{cName1} {cName2 ? '--->' + cName2 : ''}</span>
          </Item>
          <Item className='item'>
            <span className='left'>商品图片:</span>
            <span>
              {
                imgs.map(item => (
                  <img
                    key={item}
                    src={BASE_IMG_URL + item}
                    alt={item}
                  />
                ))
              }
            </span>
          </Item>
          <Item className='item'>
            <span className='left'>商品详情:</span>
            <span dangerouslySetInnerHTML={{__html: detail}}></span>
          </Item>
        </List>
     </Card>
    )
  }
}
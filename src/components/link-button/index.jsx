import React from "react"

import './index.less'

/*
  自定义button组件：
  <LinkButton onClick={this.logout}>退出</LinkButton>
  在使用LinkButton的时候传入了两个属性：onClick 文本(退出)
 */
export default function LinkButton(props) {
  /*
    使用三点运算符将所有属性传给button
    实际上text文本也会成为一个属性(children)传递过来
  */
  return  <button className='link-button' {...props}></button>
}
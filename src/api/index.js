/*
  在编写完ajax模块后，假设如下需求：
    请求登录接口
    ajax('/login', {username: 'xdh', password: 'xdh'}, method= 'POST').then()
    请求添加用户接口
    ajax('/manage/user/add', {username: 'xdh1', password: 'xdh1', phone: '123456789'}, method= 'POST').then()

    我们发现对于一个请求接口来说，请求路径是一定的，请求方式也是一定的，变化的只是数据，那么就可以进行再一次的封装：接口请求函数

  包含应用中所有的接口请求函数模块，每一函数返回的是一个promise对象
 */

import ajax from "./ajax"
import jsonp from 'jsonp'
import {message} from "antd";

const BASE = ''

// 改用箭头函数
// export function reqLogin(username, password) {
//   return ajax('/login', {username, password}, 'POST' )
// }

// 登录接口请求函数
export const reqLogin = (username, password) => ajax(BASE+'/login', {username, password}, 'POST')

// 添加/更新用户接口请求函数
export const reqAddOrUpdateUser = (user) => ajax(BASE+'/manage/user/' + (user._id ? 'update' : 'add'), user, 'POST')

// 获取所有用户列表
export const reqGetUsers = () => ajax(BASE+'/manage/user/list')

// 删除用户
export const reqDeleteUser = (userId) => ajax(BASE+'/manage/user/delete', {userId}, 'POST')

// 获取一级或某个二级分类列表
export const reqCategorys = (parentId) => ajax(BASE+'/manage/category/list', {parentId}, 'GET')

// 添加分类
export const reqAddCategory = ({parentId, categoryName}) => ajax(BASE+'/manage/category/add', {parentId, categoryName}, 'POST')

// 更新品类名称
export const reqUpdateCategory = ({categoryId, categoryName}) => ajax(BASE+'/manage/category/update', {categoryId, categoryName}, 'POST')

// 获取商品分页列表
export const reqProducts = ({pageNum, pageSize}) => ajax(BASE + '/manage/product/list', {pageNum, pageSize})

// 搜索关键字获取商品分页列表：传入searchType，决定根据名字查找还是根据描述查找
export const reqSearchProducts = ({pageNum, pageSize, searchType, searchName}) => ajax(BASE+'/manage/product/search', {pageNum, pageSize, [searchType]:searchName})

// 获取商品所在的分类
export const reqCategoryName = (categoryId) => ajax(BASE+'/manage/category/info', {categoryId})

// 修改商品的状态(在售/下架)
export const reqUpdateStatus = ({productId, status}) => ajax(BASE+'/manage/product/updateStatus', {productId, status}, 'POST')

// 删除图片
export const reqDeleteImg = (name) => ajax(BASE+'/manage/img/delete', {name}, 'POST')

// 添加/更新商品，有product._id则是更新，否则为添加
export const reqAddUpdateProduct = (product) => ajax(BASE+'/manage/product/' + (product._id ? 'update' : 'add'), product, 'POST')

// 获取角色列表
export const reqGetRoles = () => ajax(BASE+'/manage/role/list')

// 添加角色
export const reqAddRole = (roleName) => ajax(BASE+'/manage/role/add', {roleName}, 'POST')

// 设置角色权限
export const reqAuthRole = (role) => ajax(BASE+'/manage/role/update', role, 'POST')



// 获取天气信息接口函数
export const reqWeather = (city) => {
  const url = `http://api.map.baidu.com/telematics/v3/weather?location=${city}&output=json&ak=3p49MVra6urFRGOT9s8UBWr2`
  return new Promise((resolve, reject) => {
    // 发送请求
    jsonp(url, {param: 'callback'}, (err, data) => {
      // 请求成功
      if (!err && data.status === 'success') {
        // 获取需要的数据
        const {dayPictureUrl, weather} = data.results[0].weather_data[0]
        resolve({dayPictureUrl, weather})
      } else {  // 请求失败
        message.error('获取天气信息失败')
      }
    })
  })
}
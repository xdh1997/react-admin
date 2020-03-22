import React from "react"
import { Upload, Icon, Modal, message } from 'antd'
import PropTypes from 'prop-types'
import {reqDeleteImg} from "../../api"
import {BASE_IMG_URL} from "../../utils/constantsUtils";

/*
  用于图片上传的组件
 */
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default class PicturesWall extends React.Component {

  static propTypes = {
    imgs: PropTypes.array
  }

  state = {
    previewVisible: false,  // 标识是否显示大图预览
    previewImage: '',  // 预览的大图的地址
    fileList: [  
      /*{
        uid: '-1',  // 每一个图片都需要一个唯一id(最好指定为负数)
        name: 'image.png',  // 图片名
        status: 'done',  // 图片的状态：done：上传完成、uploading：正在上传、removed：已删除
        url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',  // 图片地址
      }*/
    ],
  }

  /*
    在 React 组件挂载之前，会调用它的构造函数
    通过给 this.state 赋值对象来初始化内部 state
   */
  constructor(props) {
    super(props);
    let fileList = []

    // 若传入了imgs(进入更新界面)则fileList不为空
    const {imgs} = this.props
    if (imgs && imgs.length > 0) {
      fileList = imgs.map( (item, index) => ({
        uid: -index,
        name: item,
        status: 'done',
        url: BASE_IMG_URL + item
      }))
    }

    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList  // 所有已上传的图片的地址
    }
  }

  // 取消大图预览，隐藏Modal
  handleCancel = () => this.setState({ previewVisible: false });

  // 显示大图预览
  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  // 需要修改的地方
  handleChange = async ({ file, fileList }) => {
    console.log('handleChange', file, fileList)
    // 图片上传完返回保存的名字时上传时图片本身的名字和url，要修改为上传后返回的图片名字和url(否则无法从数据库读取到该图片)
    // 上传成功后就修改当前file的属性
    if (file.status === 'done') {
      const result = file.response
      if (result.status === 0) {
        message.success('图片上传成功!')
        // 将新上传的图片进行修改
        const {name, url} = result.data
        file = fileList[fileList.length - 1]
        file.name = name
        file.url = url
        // 点击提交按钮的时候就需要收集该fileList
      } else {
        message.error('图片上传失败!')
      }
    } else if (file.status === 'removed') {
      const result = await reqDeleteImg(file.name)
      if (result.status === 0) {
        message.success('删除图片成功!')
      } else {
        message.error('删除图片失败!')
      }
    }
    this.setState({ fileList })
  };

  // 获取fileList中所有图片的名字
  getImgList = (imgList) => {
    return this.state.fileList.map(item => item.name)
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div>Upload</div>
      </div>
    );
    return (
      <div>
        <Upload
          action="/manage/img/upload" /*上传图片的地址*/
          accept='image/*'  /*只接受图片格式文件*/
          name='image'  /*请求参数名*/
          listType="picture-card"  /*图片显示的样式：卡片样式*/
          fileList={fileList}  /*已上传文件的列表*/
          onPreview={this.handlePreview}  /*显示大图*/
          onChange={this.handleChange}  
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

/*
  子组件调用父组件的方法：将父组件以函数属性的方式传递给子组件，子组件就可以调用
  父组件调用子组件的方法：给子组件添加ref属性，使其成为一个组件对象可以被父组件获取，然后父组件直接调用该对象的方法即可
  为了获取到fileList：
    方式1：子调用父
      父组件定义一个方法并传给子组件：
        <PicturesWall getImgList={(imgList) =>this.setState({imgList})}/>
      子组件获取该方法并执行：
        getImgList: PropTypes.func
        this.setState({ fileList }, () => {  // 在更新完fileList的回调函数中执行
          const imgList = this.state.fileList.map(item => item.name)
          this.props.getImgList(imgList)
        })
    方式2：父调子
      定义一个ref容器：
        constructor(props) {
          super(props)
          // 创建一个用于保存ref标示的容器，并将该容器保存到this中
          this.pw = React.createRef()
        }
      使用该容器：
        <PicturesWall ref={this.pw}/>
      执行getImgList方法：
        const imgs = this.pw.current.getImgList()

 */
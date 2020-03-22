import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {EditorState, convertToRaw, ContentState} from 'draft-js'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

/*
  用来显示商品详情的富文本编辑器
 */
export default class RichTextEditor extends Component {

  static propTypes = {
    detail: PropTypes.string
  }

  state = {
    editorState: EditorState.createEmpty(),
  }

  constructor(props) {
    super(props)
    const html = this.props.detail
    if (html) {  // 进入到更新页面时，有标签文本值，那么则显示，并更新状态
      const contentBlock = htmlToDraft(html)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        this.state = {
          editorState,
        }
      }
    } else {  // 进入添加页面，创建一个空的
      this.state = {
        editorState: EditorState.createEmpty()
      }
    }
  }

  // 上传图片
  uploadImageCallBack = (file) => {
    return new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/manage/img/upload')
        const data = new FormData()
        data.append('image', file)
        xhr.send(data)
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText)
          const url = response.data.url
          resolve({data: {link: url}})
        })
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText)
          reject(error)
        });
      }
    );
  }

  // 输入过程中的实时回调
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  }

  // 获取当前输入的标签文本
  getDetail = () => {
    console.log('----1----')
    return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
  }

  render() {
    const { editorState } = this.state;
    return (
      <Editor
        editorState={editorState}
        editorStyle={{border: '1px solid black', minHeight: 200, paddingLeft: 10}}
        onEditorStateChange={this.onEditorStateChange}
        toolbar={{
          image: { uploadCallback: this.uploadImageCallBack, alt: { present: true, mandatory: true } },
        }}
      />
    );
  }
}
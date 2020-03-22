const {override, fixBabelImports, addLessLoader} = require('customize-cra');
module.exports = override(
  // 针对antd实现按需打包：根据import进行打包
  fixBabelImports('import', {  // 使用babel-plugin-import实现
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  // 使用less less-loader对源码中的样式进行覆盖 --- 查看antd文档可进行更多的自定义配置
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {'@primary-color': '#21a511'},  // 修改全局主色
  }),
);
/** 开发环境的webpack配置 */
const config = require('./webpack.base.config.js');

// webpack-dev-server配置
config.devServer = {
  // 服务端口
  port: 8080,
  // 运行webpack-dev-server时是否自动打开默认的浏览器
  open: true
};

// 编译less
config.module.rules.push(
  {test: /\.less$/, use: ['style-loader','css-loader','postcss-loader','less-loader']},
);

module.exports = config;
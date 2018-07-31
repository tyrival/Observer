/** 生产环境的webpack配置 */
const config = require('./webpack.base.config.js');


config.module.rules.push(
  // TODO 转换成普通的javascript代码，配置到.babelrc中？？？
  // {text: '/\.js$/', loader: 'babel-loader', exclude: /node_modules/},
  {test: /\.less$/, use: ['style-loader','css-loader','postcss-loader','less-loader']}
);

module.exports = config;
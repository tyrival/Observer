/** 通用的webpack配置 */
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');
const webpack = require('webpack');

// 配置常量
// 源码的根目录
const SRC_PATH = path.resolve('./src');
// 资源文件的根目录
const ASSETS_PUBLIC_PATH = path.resolve('./src/assets');
// 编译后的文件目录
const ASSETS_BUILD_PATH = path.resolve('./dist');

module.exports = {
  // 入口文件配置
  entry: {
    main: './src/main.js'
  },
  // 输出文件配置
  output: {
    filename: 'js/[name]-[chunkhash].js',
    path: ASSETS_BUILD_PATH,
    publicPath: ''
  },

  module: {
    rules: [
      {test: /\.html$/ , loader: 'html-withimg-loader', exclude: /node_modules/},
      {test: /\.css$/, use: ['style-loader','css-loader?importLoaders=1','postcss-loader']},
      {test: /\.(png|jpg|jpeg|gif|svg)$/, loaders: ['url-loader?limit=1&name=assets/[name]-[hash:5].[ext]', 'image-webpack-loader'] },
      {test: /\.(woff|svg|eot|ttf|otf)\??.*$/, loaders: ['url-loader?name=fonts/[name].[md5:hash:hex:7].[ext]'] }
    ]
  },
  plugins: [
    // 删除dist等编译后的文件夹
    new CleanWebpackPlugin([ASSETS_BUILD_PATH]),

    /* 静态资源直接复制 */
    new CopyWebpackPlugin([{
      from: 'src/static',
      to: 'static'
    }]),

    /* 模板 */
    new HtmlWebPackPlugin({
      filename: "index.html",
      template: "index.html",
      chunks: ["main", "index"],
      chunksSortMode: "none",
      inject: "body",
      title: "顺德"
    }),
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, "/src"),
      path.resolve(__dirname, "node_modules/")
    ],
    extensions: [".js", ".less", ".css"]
  },
  node: {
    process: false,
    global: false,
    fs: "empty"
  }
};
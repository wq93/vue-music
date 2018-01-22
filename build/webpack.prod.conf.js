var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge') // 一个可以合并数组和对象的插件
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
// 用于从webpack生成的bundle中提取文本到特定文件中的插件
// 可以抽取出css，js文件将其与webpack输出的bundle分离
var HtmlWebpackPlugin = require('html-webpack-plugin')  // 一个用于生成HTML文件并自动注入依赖文件（link/script）的webpack插件
var ExtractTextPlugin = require('extract-text-webpack-plugin')  //如果我们想用webpack打包成一个文件，css js分离开，需要这个插件
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

var env = config.build.env
// 合并基础的webpack配置
var webpackConfig = merge(baseWebpackConfig, {
  // 配置样式文件的处理规则，使用styleLoaders
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap, // 启动调试模式
      extract: true
    })
  },
  // 开启source-map，生产环境下推荐使用cheap-source-map或source-map，后者得到的.map文件体积比较大，但是能够完全还原以前的js代码
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot, // 编译输出目录
    filename: utils.assetsPath('js/[name].[chunkhash].js'), // 编译输出文件名格式
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js') // 没有指定输出名的文件输出的文件名格式
  },
  // 重新配置插件项
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    // 位于开发环境下
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({ // 丑化压缩代码
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({ // html打包插件
      // 生成html文件的名字，路径和生产环境下的不同，要与修改后的publickPath相结合，否则开启服务器后页面空白
      filename: config.build.index,
      template: 'index.html',
      inject: true, // 要把<script>标签插入到页面哪个标签里(body|true|head|false)
      minify: {
        removeComments: true, // 删除注释
        collapseWhitespace: true, // 删除空格
        removeAttributeQuotes: true // 删除html属性的引号
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),

    // 如果文件是多入口的文件，可能存在，重复代码，把公共代码提取出来，又不会重复下载公共代码了
    // （多个页面间会共享此文件的缓存）
    // CommonsChunkPlugin的初始化常用参数有解析？
    // name: 这个给公共代码的chunk唯一的标识
    // filename，如何命名打包后生产的js文件，也是可以用上[name]、[hash]、[chunkhash]
    // minChunks，公共代码的判断标准：某个js模块被多少个chunk加载了才算是公共代码

    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({ // 为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
      name: 'manifest',
      chunks: ['vendor']
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

// 检查 Node 和 npm 版本
require('./check-versions')()

process.env.NODE_ENV = 'production' // 生产模式

var ora = require('ora') // 一个很好看的 loading 插件
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')  // 加载 webpack
var config = require('../config') // 加载 config.js
var webpackConfig = require('./webpack.prod.conf')  // 加载 webpack.prod.conf

var spinner = ora('building for production...')
spinner.start()

// 打包之前把上次打包的文件删除掉
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})

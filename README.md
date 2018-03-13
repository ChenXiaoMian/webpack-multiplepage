# webpack-multiplepage

webpack前端工程化多页面配置

## 前言

平时工作中，公司项目没有做前后端分离，用的还是grunt+seajs比较旧的技术，基本是后端主导，前端只负责样式和效果，没办法有更多尝试。不过，前端技术日新月异，不能因为环境而局限自己想折腾的心，于是，在看过[《基于webpack的前端工程化开发之多页站点篇》](https://segmentfault.com/a/1190000004511992)这篇文章之后，开始尝试。

## 项目依赖

`npm init` 初始化项目

`npm install plugins --save-dev` 安装依赖

`package.json` 依赖声明如下：
```javascript
"devDependencies": {
    "babel-core": "^6.26.0",                    // babel转译核心
    "babel-loader": "^7.1.2",                   // webpack使用转换ES6
    "babel-preset-env": "^1.6.1",               // 转码规则，按需转译
    "clean-webpack-plugin": "^0.1.18",          // 清理文件
    "copy-webpack-plugin": "^4.5.0",            // 复制文件
    "css-loader": "^0.28.9",                    // 将css装载到js
    "exports-loader": "^0.7.0",                 // 模块化，导出指定对象
    "extract-text-webpack-plugin": "^3.0.2",    // 将css分离成文件
    "file-loader": "^1.1.11",                   // 解析项目中的url引入
    "glob": "^7.1.2",                           // 根据模式匹配获取文件列表的node模块
    "html-loader": "^0.5.5",                    // 解析html文件的url
    "html-webpack-plugin": "^2.30.1",           // 处理html文件
    "node-sass": "^4.7.2",                      // 编译sass
    "sass-loader": "^6.0.7",                    // 将sass文件编译成css
    "script-loader": "^0.7.2",                  // 全局上下文执行一次 JS 脚本
    "style-loader": "^0.20.1",                  // css插入到页面的style标签
    "uglifyjs-webpack-plugin": "^1.1.8",        // 压缩js
    "url-loader": "^1.0.1",                     // url-loader封装了file-loader，将小图片生成dataURl
    "webpack": "^3.9.1",                        // webpack核心
    "webpack-dev-server": "^2.11.1",            // 热更新服务
    "webpack-merge": "^4.1.1"                   // 合并配置
}
```

`npm run dev` 执行开发环境，点击进入`view`文件夹

`npm run build` 执行打包发布

## 目录结构

```
- website
    - config             #webpack配置目录
        - util           #入口文件逻辑
        base.js          #基本配置
        dev.js           #开发配置
        pro.js           #发布配置
    - src                #代码开发目录
        - scss           #sass文件目录
        - css            #css目录，按照页面（模块）、通用、第三方三个级别进行组织
            + page       #页面级css目录
        + img            #图片资源
        - js             #JS脚本，按照page、components进行组织
            + page       #页面级js目录
        + view           #HTML模板
    - dist               #webpack编译打包输出目录，无需建立目录可由webpack根据配置自动生成
        + css
        + js
        + view
    + node_modules       #所使用的nodejs模块
    .gitignore           #忽略项
    package.json         #项目配置
    package-lock.json    #版本锁定，类似yarn
    README.md            #项目说明
```

项目目录有个局限性，就是开发目录里`js`中固定需要`page`文件夹放置页面级的js逻辑，与`view`中的`.html`文件一一对应。

## 开发

在src/js/page目录下建立index.js文件，在src/view目录下建立index.html文件。入口js和模板文件名对应。

index.js文件如下（这里已默认引入`zepto`，可直接使用`$`）：

```javascript
require("scss/variable.scss");

$(".gb-body").text("测试的一段话");
```

index.html 内容如下：
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>测试首页</title>
    <!--
        描述：head中无需再引入css以及facicon，webpack将根据入口JS文件的要求自动实现按需加载或者生成style标签
    -->
</head>
<body>
    <div class="gb-body"></div>
    <!--
        描述：body中同样无需单独引入JS文件，webpack会根据入口JS文件自动实现按需加载或者生成script标签，还可以生成对应的hash值
    -->
</body>
</html>
```

## webpack配置

webpack配置`base.js`如下：

```javascript
const path = require('path')                                                // 引入node模块，获取路径
const cwd = process.cwd()                                                   // 当前Node.js进程执行时的工作目录
const webpack = require('webpack')                                          // 引入webpack
const ExtractTextPlugin = require("extract-text-webpack-plugin")            // 分离css
const getEntry = require('./util/getEntry.js')
const getHtml = require('./util/getHtml.js')

const entryList = getEntry(path.resolve(cwd, 'src/js/page/**/*.js'))        // 获取入口文件配置
const htmlPluginList = getHtml(path.resolve(cwd, 'src/view/**/*.html'))     // 生成html配置
const chunksList = Object.keys(entryList)                                   // 获取公共代码列表

// 抽取公共模块
const chunkPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: 'vendors',
    chunks: chunksList,
    minChunks: chunksList.length
})
// 分离css配置
const extractPlugin = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css',
    disable: process.env.NODE_ENV === "development"
})
const plugins = [
    // 自动加载模块
    new webpack.ProvidePlugin({
        $: 'zepto'
    }),
    extractPlugin,
    chunkPlugin
].concat(htmlPluginList)


module.exports = {
    // 入口
    entry: entryList,
    // 输出目录
    output: {
        path: path.resolve(cwd, './dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js'
    },
    // 解析别名
    resolve: {
        extensions: ['.js','.json'],
        alias: {
            '@': path.join(cwd, 'src'),
            'css': path.join(cwd, 'src/css'),
            'scss': path.join(cwd, 'src/scss'),
            'js': path.join(cwd, 'src/js')
        }
    },
    module: {
        rules: [
            // 处理html文件url
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            // 处理css文件
            {
                test: /\.css$/,
                use: extractPlugin.extract({
                    use: 'css-loader',
                    fallback: 'style-loader'
                })
            },
            // 处理scss文件
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: ['css-loader','sass-loader'],
                    fallback: 'style-loader'
                })
            },
            // es6转译
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env']
                    }
                }
            },
            // 图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
            // 如下配置，将小于8192byte的图片转成base64码
            {
                test: /\.(png|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        name: './img/[hash].[ext]'
                    }
                }
            },
            // 处理字体文件
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: './fonts/[name].[ext]'
                    }
                }
            },
            // exports-loader模块化zepto
            // https://sebastianblade.com/how-to-import-unmodular-library-like-zepto/
            {
                test: require.resolve('zepto'),
                use: ['exports-loader?window.Zepto','script-loader']
            }
        ]
    },
    plugins: plugins
}
```

webpack开发配置`dev.js`如下：

```javascript
const webpack = require('webpack')                                    // webpack
const merge = require('webpack-merge')                                // 合并插件
const config = require('./base.js')                                   // 基础配置

module.exports = merge(config, {
    devtool: 'inline-source-map',
    devServer: {                                                      // 热更新
        contentBase: './src',                                         // 基于哪个目录
        host: 'localhost',
        port: 9090,
        inline: true,
        hot: true                                                     // 热启动
    },
    plugins: [
        new webpack.NamedModulesPlugin(),                             // 当开启HMR的时候使用该插件会显示模块的相对路径
        new webpack.HotModuleReplacementPlugin()                      // 模块热替换插件
    ]
});
```

webpack开发配置`pro.js`如下：

```javascript
const path = require('path')
const cwd = process.cwd()
const merge = require('webpack-merge')
const config = require('./base.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')               // 拷贝资源插件
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')              // 压缩js插件
const CleanWebpackPlugin = require('clean-webpack-plugin')             // 清理文件插件

module.exports = merge(config, {
    plugins: [
        new CleanWebpackPlugin(['dist','build','dist/img'],{
            root: cwd,
            verbose: true
        }),
        new UglifyJSPlugin(),
        new CopyWebpackPlugin([                                         // 复制图片文件夹
            {
                from: path.join(cwd, 'src/img'),
                to: path.join(cwd, 'dist/img')
            }
        ])
    ]
});
```

### 根据模式匹配获取文件列表

结合[《基于webpack的前端工程化开发之多页站点篇（一）》](https://segmentfault.com/a/1190000004511992)和[《基于webpack的前端工程化开发之多页站点篇（二）》](https://segmentfault.com/a/1190000004516832)这两篇文章，应该很容易完成配置，但是我也发现一个问题，就是在`view`配置多级目录的时候类似`view/question/question.html`，打包配置会出问题，就仅局限于当前目录。

于是参考了[kisnows 抹桥](https://github.com/kisnows)的[Spart](https://github.com/kisnows/spart)项目webpack配置，对入口和html生成配置做了调整。

`getEntry.js`如下：
```javascript
const glob = require('glob')
const path = require('path')
const cwd = process.cwd()

module.exports = function(jsPath){
    const entrys = {}
    const entryFiles = glob.sync(jsPath)
    const reg = /src\/(\S+)$/
    const fileReg = /src\/js\/(\S+).js$/
    entryFiles.forEach((v) => {
      const pathname = v.match(reg)[1]
      const filename = v.match(fileReg)[1]
      entrys[filename] = `./src/${pathname}`
    })
    return entrys
}
```

`getEntry.js`输出结果如下（举个栗子）：
```javascript
{
    'page/about': './src/js/page/about.js',
    'page/index': './src/js/page/index.js',
    'page/question/question': './src/js/page/question/question.js'
}
```

`getHtml.js`如下：
```javascript
const glob = require('glob')
const path = require('path')
const cwd = process.cwd()
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = function (htmlPath){
    const pluginList = []
    const htmlFileList = glob.sync(htmlPath)
    const reg = /src\/(\S+)$/
    const fileReg = /src\/view\/(\S+).html$/
    htmlFileList.forEach((v)=>{
        const pathname = v.match(reg)[1]
        const filename = path.basename(v, path.extname(v))
        const shortname = v.match(fileReg)[1]
        pluginList.push(
            new HtmlWebpackPlugin({
                filename: `${pathname}`,
                template: `./src/${pathname}`,
                inject: 'body',
                chunks: ['vendors', `page/${shortname}`],
                hash: false,
                minify: process.env.NODE_ENV !== 'production' ? false : {
                  removeAttributeQuotes: true,
                  removeComments: true,
                  collapseWhitespace: true,
                  html5: true,
                  minifyCSS: true
                }
            })
        )
    })
    return pluginList
}
```

`getHtml.js`输出结果如下（举个栗子）:
```javascript
[
    {
        filename: 'view/about.html',
        template: './src/view/about.html',
        inject: 'body',
        chunks: [ 'page/vendors', 'page/about' ],
        hash: false,
        minify: false
    },
    {
        filename: 'view/index.html',
        template: './src/view/index.html',
        inject: 'body',
        chunks: [ 'page/vendors', 'page/index' ],
        hash: false,
        minify: false
    },
    {
        filename: 'view/question/question.html',
        template: './src/view/question/question.html',
        inject: 'body',
        chunks: [ 'page/vendors', 'page/question/question' ],
        hash: false,
        minify: false
    }
]
```

### [如何在 webpack 中引入未模块化的库，如 Zepto](https://sebastianblade.com/how-to-import-unmodular-library-like-zepto/)

解决方法：

```
$ npm i -D script-loader exports-loader
```

引入script-loader与exports-loader，然后参考以上的配置


### [NodeJs中process.cwd()与__dirname的区别](https://www.cnblogs.com/tim100/p/6590733.html)

`process.cwd()` 是当前执行node命令时候的文件夹地址 ——工作目录，就是说 `process.cwd()` 返回的是当前Node.js进程执行时的工作目录

`__dirname` 是被执行的js文件的地址 ——文件所在目录，等同于 `__filename` 的 `path.dirname()`


## 参考

> * [基于webpack的前端工程化开发之多页站点篇（一）](https://segmentfault.com/a/1190000004511992)
> * [基于webpack的前端工程化开发之多页站点篇（二）](https://segmentfault.com/a/1190000004516832)
> * [webpack概念](https://doc.webpack-china.org/concepts/)
> * [sass](https://www.sass.hk/guide/)
> * [NodeJs中process.cwd()与__dirname的区别](https://www.cnblogs.com/tim100/p/6590733.html)
> * [如何在 webpack 中引入未模块化的库，如 Zepto](https://sebastianblade.com/how-to-import-unmodular-library-like-zepto/)
> * [抹桥的博客](https://blog.kisnows.com/archives/)


## 结语

其实在配置的过程中，有考虑到一个问题，就是后端童鞋不一定会用你这一套东西，就好像[@抹桥](https://github.com/kisnows)说的那样，感觉这是为了用 webpack 而用 webpack 的节奏，还不如直接用gulp来的方便。可能确实也可能如此，但后面又想一想，思路通了就做一下吧，不能总是半途而废，于是就有了这篇文章。

配置的时候，参照了很多文章，自身水平有限，如有冒犯，请通知我！

谢谢您的品读:blush:，此处抛砖引玉，希望大家共同探讨学习。
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
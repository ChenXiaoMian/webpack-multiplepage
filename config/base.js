const path = require('path')
const cwd = process.cwd()
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const getEntry = require('./util/getEntry.js')
const getHtml = require('./util/getHtml.js')

const entryList = getEntry(path.resolve(cwd, 'src/js/page/**/*.js'))
const htmlPluginList = getHtml(path.resolve(cwd, 'src/view/**/*.html'))
const chunksList = Object.keys(entryList)
const chunkPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: 'vendors',
    chunks: chunksList,
    minChunks: chunksList.length
})
const extractPlugin = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css',
    disable: process.env.NODE_ENV === "development"
})
const plugins = [
    new webpack.ProvidePlugin({
        $: 'zepto'
    }),
    extractPlugin,
    chunkPlugin
].concat(htmlPluginList)


module.exports = {
    entry: entryList,
    output: {
        path: path.resolve(cwd, './dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js'
    },
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
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: /\.css$/,
                use: extractPlugin.extract({
                    use: 'css-loader',
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: ['css-loader','sass-loader'],
                    fallback: 'style-loader'
                })
            },
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
            {
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: './fonts/[name].[ext]'
                    }
                }
            },
            {
                test: require.resolve('zepto'),
                use: ['exports-loader?window.Zepto','script-loader']
            }
        ]
    },
    plugins: plugins
}
const webpack = require('webpack')
const merge = require('webpack-merge')
const config = require('./base.js')

module.exports = merge(config, {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './src',
        host: 'localhost',
        port: 9090,
        inline: true,
        hot: true
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
});

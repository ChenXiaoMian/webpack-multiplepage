const path = require('path')
const cwd = process.cwd()
const merge = require('webpack-merge')
const config = require('./base.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = merge(config, {
    plugins: [
        new CleanWebpackPlugin(['dist','build','dist/img'],{
            root: cwd,
            verbose: true
        }),
        new UglifyJSPlugin(),
        new CopyWebpackPlugin([
            {
                from: path.join(cwd, 'src/img'),
                to: path.join(cwd, 'dist/img')
            }
        ])
    ]
});
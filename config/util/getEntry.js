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
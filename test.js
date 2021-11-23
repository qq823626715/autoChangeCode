/*
 * @Author: LiuShengRong
 * @Date: 2021-10-20 15:02:08
 * @LastEditTime: 2021-10-20 16:43:11
 * @LastEditors: LiuShengRong
 * @Description: 
 */
const fs = require('fs')
const path = require('path')
const appArray = require('./log/chinese')

function runConcat() {
  let allChinese = []
  let chineseContent = 'module.exports = {\n'
  appArray.forEach((item, index) => {
    chineseContent += `lang${index+1}: "${item}",\n`
  })
  chineseContent += '}'
  const chinestFilePath = './log/chinese.js'
  fs.writeFile(path.join(__dirname, chinestFilePath), chineseContent, 'utf8', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("文件生成完成！");
  })
}
runConcat()
/*
 * @Author: LiuShengRong
 * @Date: 2021-10-20 10:49:49
 * @LastEditTime: 2021-10-20 14:32:53
 * @LastEditors: LiuShengRong
 * @Description: 读取文件内容
 */
const fs = require('fs')
const path = require('path')
const changeRules = require("./rules")

const readFileContent = function(files, chineseFileName) {
  let chineseArry = []
  files.forEach((item, index) => {
    console.log('item', item)
    console.log('index', index)
    let fileName = item
    //获取文件内容
    let fileContent = fs.readFileSync(item, 'utf8')
    // 对文本进行切割，分为 <template></template>模块，以及<script></script>模块
    const tempRge = new RegExp(/(?<=<template>)(.|\n|\r)*(?=<\/template>)/g)
    const scriptRge = new RegExp(/(?<=<script>)(.|\n|\r)*(?=<\/script>)/g)
    console.log('切割')
    const tempContets = fileContent.match(tempRge)
    const scriptContets = fileContent.match(scriptRge)
    console.log('读取')
    let templateContent = tempContets && tempContets.length > 0 ? tempContets[0] : ''
    let scriptContent = scriptContets && scriptContets.length > 0 ? scriptContets[0] : ''
    console.log('判断')
    // 针对不模块内容，调用不同模块规则替换
    const templateContentChinese1 = getFileContentChinese(templateContent, 'template', changeRules.attrRule)
    console.log('reg1')
    const templateContentChinese2 = getFileContentChinese(templateContent, 'template', changeRules.contentRule)
    console.log('reg2')
    const scriptContentChinese = getFileContentChinese(scriptContent, 'script', changeRules.scriptRule)
    console.log('reg3')
    if(templateContentChinese1.length > 0) {
      chineseArry = chineseArry.concat(templateContentChinese1)
    }
    if(templateContentChinese2.length > 0) {
      chineseArry = chineseArry.concat(templateContentChinese2)
    }
    if(scriptContentChinese.length > 0) {
      chineseArry = chineseArry.concat(scriptContentChinese)
    }
    console.log('数组拼接完成')
  })
  
  console.log('length', files.length)
  chineseArry = Array.from(new Set(chineseArry))
  let chineseContent = ''
  chineseArry.forEach((item, index) => {
    chineseContent += `lang${index}='${item}'\n`
  })
  const chinestFilePath = './log/' + chineseFileName + '.js'
  fs.writeFile(path.join(__dirname, chinestFilePath), chineseContent, 'utf8', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("文件生成完成！");
  })
}


/**
 * @description 替换修改文件内容，并返回修改后的文件内容
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 *  包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * @return {String} 替换后的文本内容
 * @time 2021/03/22
 * @author LiuShengRong
 */
 function getFileContentChinese(content, elementFlag, { type, reg1, reg2 }) {
  // 搜索出所有符合规格的string
  console.log('进入函数')
  let contentText = []
  console.log('准备获取', content)
  let contentType = content.match(type)
  if (contentType && contentType.length > 0) {
    contentText = contentType.map(item => {
      console.log('处理开始', item)
      let chineseContent = ""
      if (!reg1) {
        chineseContent = item.replace(reg2, "").trim()
      } else {
        chineseContent = item.match(reg1)[0].trim().replace(reg2, "").trim()
      }
      console.log('处理结束', chineseContent)
      return chineseContent
    })
  }
  return contentText
}

module.exports = readFileContent
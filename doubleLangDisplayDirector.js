/**
 * @Description: 双语同屏显示 将表格里的 :label="$t('**')" 替换成solt模式
 * @Author: LiuShengRong
 */
const path = require('path')
const fs = require('fs')
const changeRules = require("./rules")

const { zhLangFilePath } = require("./settings")
const zhlangObj = require(zhLangFilePath)

let contentLog = []
function fnModifyI18n(item, modifyLog) {
  console.log('fnModifyI18n')
  let fileName = item
  //获取文件内容
  let fileContent = fs.readFileSync(item, 'utf8')
  // 对文本进行切割，提取<template></template>模块
  const tempRge = new RegExp(/(?<=<template>)(.|\n|\r)*(?=<\/template>)/g)
  const tempContets = fileContent.match(tempRge)
  let templateContent = tempContets && tempContets.length > 0 ? tempContets[0] : ''
  // 调用规则替换
  templateContent = changFileContent(templateContent, 'template', changeRules.tableHeaderLabelRule)
  // changFileContent(templateContent, 'template', changeRules.tableHeaderLabelRule)
  // 解决文本中含有 $1 等特殊replace文本时bug
  fileContent = fileContent.replace(tempRge, () => {
    return templateContent
  })

  if(contentLog.length > 0) {
    modifyLog.push('-------------------------\n\nfileName：' + fileName + '\n\n')
    modifyLog.push(...contentLog)
    contentLog = []
  }

  fs.writeFile(item, fileContent, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log(item + "文件替换完成！");
  })
}

/**
 * @description 替换修改文件内容，并返回修改后的文件内容 适用于中文替换成i18n
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 *  包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * @return {String} 替换后的文本内容
 * @time 2021/03/22
 * @author LiuShengRong
 */
 function changFileContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  content = content.replace(reg1, function(match, p1,p2,p3,p4,index) {
    const chineseText = zhlangObj[p3]
    if(chineseText) {
      let newText = `${p1}${p2}label="${chineseText}"${p4}>
  ${p1}<template slot="header" slot-scope="{column}">
    ${p1}<p class="table-hearder-double-line">{{ column.label }}</p>
    ${p1}<p v-if="isTiPage" class="table-hearder-double-line">{{ $t('${p3}') }}</p>
  ${p1}</template>`
      contentLog.push('i18nKey => ' + p3 + '\n')
      if(/\/>$/.test(match)) {
        newText = newText + `\n${p1}</el-table-column>`
      }
      contentLog.push(match + ' => ' + newText + '\n')
      return newText
    } else {
      return match
    }
  })
  return content
}
module.exports = fnModifyI18n
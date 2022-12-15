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
  let fileName = item
  //获取文件内容
  let fileContent = fs.readFileSync(item, 'utf8')
  // 对文本进行切割，提取<template></template>模块
  const tempRge = new RegExp(/(?<=<template>)(.|\n|\r)*(?=<\/template>)/g)
  const tempContets = fileContent.match(tempRge)
  let templateContent = tempContets && tempContets.length > 0 ? tempContets[0] : ''
  // 调用规则替换
  // templateContent = changFileTableContent(templateContent, 'template', changeRules.tableHeaderLabelRule)
  // templateContent = changFileFormContent(templateContent, 'template', changeRules.formItemLabelRule)
  templateContent = changFileButtonContent(templateContent, 'template', changeRules.buttonRule)
  // templateContent = changFileTitleContent(templateContent, 'template', changeRules.titleRule)
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
 * @author LiuShengRong
 */
function changFileTableContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  content = content.replace(type, function(match, p1,p2,p3,p4,index) {
    const keys = p3.split('.')
    let chineseText = zhlangObj
    for(let i = 0; i < keys.length;i++) {
      chineseText = chineseText[keys[i]]
    }
    // const chineseText = zhlangObj[p3]
    if(chineseText && chineseText !== zhlangObj) {
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
/**
 * @description 替换修改文件内容，并返回修改后的文件内容 适用于中文替换成i18n
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 *  包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * @return {String} 替换后的文本内容
 * @author LiuShengRong
 */
function changFileFormContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  content = content.replace(type, function(match, p1,p2,p3,p4,index) {
    const keys = p3.split('.')
    let chineseText = zhlangObj
    for(let i = 0; i < keys.length;i++) {
      chineseText = chineseText[keys[i]]
    }
    // const chineseText = zhlangObj[p3]
    if(chineseText && chineseText !== zhlangObj) {
      let newText = `${p1}${p2}label="${chineseText}"${p4}>
  ${p1}<template slot="label">
    ${p1}<p class="label-double-line">${chineseText}：</p>
    ${p1}<p v-if="isTiPage" class="label-double-line">{{ $t('${p3}') }}：</p>
  ${p1}</template>`
      contentLog.push('i18nKey => ' + p3 + '\n')
      contentLog.push(match + ' => ' + newText + '\n')
      return newText
    } else {
      return match
    }
  })
  return content
}
/**
 * @description 替换修改文件内容，并返回修改后的文件内容 适用于中文替换成i18n
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 *  包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * @return {String} 替换后的文本内容
 * @author LiuShengRong
 */
function changFileButtonContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  content = content.replace(type, function(match, p1,index) {
    const keys = p1.split('.')
    let chineseText = zhlangObj
    for(let i = 0; i < keys.length;i++) {
      chineseText = chineseText[keys[i]]
    }
    console.log('chineseText', chineseText)
    if(chineseText && chineseText !== zhlangObj) {
      let newText = `\n<p class="el-button-double-line">${chineseText}</p>
      <p v-if="isTiPage" class="el-button-double-line">{{ $t('${p1}') }}</p>\n`
      contentLog.push('i18nKey => ' + p1 + '\n')
      contentLog.push(match + ' => ' + newText + '\n')
      return newText
    } else {
      return match
    }
  })
  return content
}
/**
 * @description 替换修改文件内容，并返回修改后的文件内容 适用于中文替换成i18n
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 *  包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * @return {String} 替换后的文本内容
 * @author LiuShengRong
 */

function changFileTitleContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  /**
   * @description: 
   * @param {*} type
   * @param {*} function
   * @param {*} p1 <ybj-title之后 $t('***')之前的字符
   * @param {*} p2 $t('***')
   * @param {*} p3 $t内部的key lang*** or ***.**
   * @param {*} p4 $t()表达式后面的 " or '
   * @param {*} index
   * @return {String} 返回的template内容
   */
  content = content.replace(type, function(match, p1, p2, p3, p4, index) {
    const keys = p3.split('.')
    let chineseText = zhlangObj
    for(let i = 0; i < keys.length;i++) {
      chineseText = chineseText[keys[i]]
    }
    console.log('chineseText', chineseText)
    if(chineseText && chineseText !== zhlangObj) {
      let newText = `${p1}\`${chineseText} \${isTiPage?${p2}:''}\`${p4}`
      contentLog.push('i18nKey => ' + p3 + '\n')
      contentLog.push(match + ' => ' + newText + '\n')
      return newText
    } else {
      return match
    }
  })
  return content
}
module.exports = fnModifyI18n
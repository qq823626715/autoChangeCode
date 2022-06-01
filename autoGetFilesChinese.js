/**
 * @Author: LiuShengRong
 * @Date: 2021-03-22 03:02:01
 * @LastEditTime: 2022-06-01 11:21:42
 * @LastEditors: Please set LastEditors
 * @Description: 替换中文
 */
const path = require('path')
const fs = require('fs')
const { projectPath, zhLangFilePath, fileType, projectName } = require("./settings")
const changeRules = require("./rules")
const zhlangObj = require(zhLangFilePath)
const langObj = {} // 反转zhlangObj对象
//获取文件的具体信息
const getPathInfo = p => path.parse(p)
let modifyLog = []
let contentLog = []
let modifyFileNum = 0
let modifyContentNum = 0

/**
 * @description // 递归读取文件，类似于webpack的require.context()
 * @time 2020-9-12
 *
 * @param {String} directory 文件目录
 * @param {Boolean} useSubdirectories 是否查询子目录，默认false
 * @param {array} extList 查询文件后缀，默认 ['.js']
 *
 */
function autoLoadFile(directory, useSubdirectories = false, extList = ['.js']) {
  const filesList = []
  // 递归读取文件
  function readFileList(directory, useSubdirectories, extList) {
    const files = fs.readdirSync(directory)
    files.forEach(item => {
      const fullPath = path.join(directory, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory() && useSubdirectories) {
        readFileList(path.join(directory, item), useSubdirectories, extList)
      } else {
        const info = getPathInfo(fullPath)
        //将文件路径存放到 filesList 中 
        extList.includes(info.ext) && filesList.push(fullPath)
      }
    })
  }
  readFileList(directory, useSubdirectories, extList)
  console.log("********递归文件读取完成**********");
  // 生成需要的对象
  filesList.forEach((item, index) => {
    let fileName = item
    //获取文件内容
    let fileContent = fs.readFileSync(item, 'utf8')
    // 对文本进行切割，分为 <template></template>模块，以及<script></script>模块
    const tempRge = new RegExp(/(?<=<template>)(.|\n|\r)*(?=<\/template>)/g)
    const scriptRge = new RegExp(/(?<=<script>)(.|\n|\r)*(?=<\/script>)/g)
    const tempContets = fileContent.match(tempRge)
    const scriptContets = fileContent.match(scriptRge)
    let templateContent = tempContets && tempContets.length > 0 ? tempContets[0] : ''
    let scriptContent = scriptContets && scriptContets.length > 0 ? scriptContets[0] : ''
    // 针对不模块内容，调用不同模块规则替换
    const templateChinese1 = getChinese(templateContent, 'template', changeRules.attrRule)
    const templateChinese2 = getChinese(templateContent, 'template', changeRules.contentRule)
    const scriptChinese = getChinese(scriptContent, 'script', changeRules.scriptRule)
    modifyLog.push(...templateChinese1, ...templateChinese2, ...scriptChinese)
  })
  modifyLog = Array.from(new Set(modifyLog))
  createChageLog()
}

/**
 * @description: 读取文件中中文内容
 * @param {String} content 内容
 * @param {String} elementFlag 模块标识 element script
 * @param {*} type
 * @param {*} reg1
 * @param {*} reg2
 * @param {*} changeContent
 * @param {*} sliceFlag
 * @return {Array} 包含所有中文数组
 */
function getChinese(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  // 搜索出所有符合规格的string
  let contentType = content.match(type)
  if(contentType) {
    contentType = contentType.map(item => {
      if (!reg1) {
        return item.replace(reg2, "").trim()
      } else {
        return item.match(reg1)[0].trim().replace(reg2, "").trim()
      }
    })
  }
  
  // if (contentType && contentType.length > 0) {
  //   //去重
  //   contentType = Array.from(new Set(contentType))
  // }
  return contentType || []
}

/**
 * @description 根据modifyLog生成日志
 */
function createChageLog() {
  const time = new Date()
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const day = time.getDate()
  const hour = time.getHours()
  const minute = time.getMinutes()
  const seconds = time.getSeconds()
  // 不能使用 英文的":" fs报错找不到文件
  const logName = `${projectName}未翻译中文${year}-${month}-${day} ${hour}：${minute}：${seconds}_log`
  const logPath = './log/' + logName + '.txt'
  let logContent = ""
  modifyLog.forEach(item => {
    logContent += (item + '\n')
  })
  fs.writeFile(path.join(__dirname, logPath), logContent, 'utf8', (err) => {
    if (err) {
      return console.error(err);
    }
    console.log("--------日志写入成功-----------")
  })
}

function getI18nKey(chinese, obj) {
  const zhlangKeys = Object.keys(obj)
  let i18nKey = ""
  zhlangKeys.some(zhlangKey => {
    if(typeof(obj[zhlangKey]) === 'string') {
      if(obj[zhlangKey] === chinese) {
        i18nKey = zhlangKey
        return true
      } else {
        return false
      }
    } else {
      i18nKey = getI18nKey(chinese, obj[zhlangKey])
      if(i18nKey === "") {
        return false
      } else {
        i18nKey = zhlangKey + '.' + i18nKey
        return true
      }
    }
  })
  return i18nKey
}

autoLoadFile(projectPath, true, fileType)
// autoLoadFile(path.join(__dirname, projectPath), true, fileType)




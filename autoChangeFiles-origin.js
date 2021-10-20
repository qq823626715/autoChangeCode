/**
 * @description: 替换中文
 * @param {*}
 * @return {*}
 * @author: LiuShengrong
 * @time 2021-03-22
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
let modifyFileNum = 0
let modifyContentNum = 0

/**
 * @description // 反转读取到的国际化文件对象， key => value; value => key
 * @time 2021-03-23
 * @author LiuShengRong
 * TODO: {{ scope.row.certno.replace(/^(.{6})(?:\d+)(.{4})$/, '$1****$2') }} 中，$1被替换为\n（原因未知） 
 */
function exchangeKeyValue() {
    // 反转对象的key、value，将zh.js中的 key，value交换 以中文为Key，国际化ID为value
    const langKeys = Object.keys(zhlangObj)
    langKeys.forEach(item => {
      langObj[zhlangObj[item]] = item
    })
}

/**
 * @description 用于国际化js 内容为双重嵌套的json
 */
function doubleObjExchangeKeyValue() {
  const langKeys = Object.keys(zhlangObj)
    langKeys.forEach(item => {
      itemKeys = Object.keys(zhlangObj[item])
      itemKeys.forEach(item_2 => {
        langObj[zhlangObj[item][item_2]] = item + '.' + item_2
      })
    })
}

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
  // exchangeKeyValue()
  // doubleObjExchangeKeyValue()
  // console.log("********zh.js文件转换完成**********");
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
  const res = filesList.map((item, index) => {
    let fileName = item
    modifyLog.push('-------------------------\n\nfileName：' + fileName + '\n\n')
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
    templateContent = changFileContent(templateContent, 'template', changeRules.attrRule)
    templateContent = changFileContent(templateContent, 'template', changeRules.contentRule)
    scriptContent = changFileContent(scriptContent, 'script', changeRules.scriptRule)
    scriptContent = changFileContent(scriptContent, 'script', changeRules.scriptRule2)
    // 解决文本中含有 $1 等特殊replace文本时bug
    fileContent = fileContent.replace(tempRge, () => {
      return templateContent
    })
    fileContent = fileContent.replace(scriptRge, () => {
      return scriptContent
    })

    fs.writeFile(item, fileContent, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log(item + "文件替换完成！");
    })
  })
  createChageLog()
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
function changFileContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  // 搜索出所有符合规格的string
  let contentType = content.match(type)
  if (contentType && contentType.length > 0) {
    //去重
    contentType = Array.from(new Set(contentType))
    for (let i = 0; i < contentType.length; i++) {
      //获取主要中文内容，用于替换
      let originContent = contentType[i]
      // 如果有切割标志，则切割字符串，获取前缀（label,title,placeholder等）
      let prefix = ""
      if (sliceFlag) {
        prefix = originContent.split(sliceFlag)[0].trim()
      }

      let chineseContent = ""
      if (!reg1) {
        chineseContent = originContent.replace(reg2, "").trim()
      } else {
        // 查找出符合规则的中文字符串
        chineseContent = originContent.match(reg1)[0].trim()
          // 去除头尾标志，只留需要替换的内容
          .replace(reg2, "").trim()
      }
      // 替换文本匹配内容 将()转成转义字符，因为在""中，所以需要\\
      let originContentFormatter = originContent.replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\//g, "\\/")
      // 防止一些不符合标准的中文被全局替换
      if(elementFlag === 'script') {
        originContentFormatter = '(?<!(!=|==)=?\\s*)' + originContentFormatter + '(?!\\s*(!=|==)=?)'
      }
      const replaceReg = new RegExp(originContentFormatter, 'g')
      if (Object.values(zhlangObj).includes(chineseContent)) {
        content = content.replace(replaceReg, (target) => {
          const newText = changeContent(getI18nKey(chineseContent), prefix)
          modifyLog.push(target + ' => ' + newText + '\n')
          return newText
        })
      }
    }
  }
  return content
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
  const logName = `${projectName}${year}-${month}-${day} ${hour}：${minute}：${seconds}_log`
  const logPath = './log/' + logName + '.txt'
  let logContent = ""
  modifyLog.forEach(item => {
    logContent += item
  })
  fs.writeFile(path.join(__dirname, logPath), logContent, 'utf8', (err) => {
    if (err) {
      return console.error(err);
    }
    console.log("--------日志写入成功-----------")
  })
}

function getI18nKey(chinese) {
  const zhlangKeys = Object.keys(zhlangObj)
  let i18nKey = ""
  zhlangKeys.some(zhlangKey => {
    if(zhlangObj[zhlangKey] === chinese) {
      i18nKey = zhlangKey
      return true
    } else {
      return false
    }
  })
  return i18nKey
}

autoLoadFile(projectPath, true, fileType)
// autoLoadFile(path.join(__dirname, projectPath), true, fileType)




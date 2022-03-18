const path = require('path')
const fs = require('fs')

// const filePath = "D:/Workspace/YiLianZhong/person-service-mall/src/assets/js/lang/ti.js"
const zhlangObj = require("E:/Workspace/YiLianZhong/qinghai/pw/src/assets/js/lang/zh.js")
// const newZhlang = require("E:/Workspace/YiLianZhong/nodeRelace/log/zh.js")
// const tilangObj = require("D:/Workspace/YiLianZhong/hsa-pss-cw-nation/src/assets/js/lang/ti.js")

function changFile() {
    let fileContent = fs.readFileSync(filePath, 'utf8')
    const chineseArray = fileContent.match(/"([^"/]*[\u4E00-\u9FA5]{1,}[^"]*)+"/g)
    chineseArray.forEach((item, index) => {
        console.log('替换进度：' + index + '/' + chineseArray.length)
        const chineseValue = chineseFormatter(item)
        const i18nKey = getI18nKey(chineseValue)
        const tiValue = getTiValue(i18nKey)
        if(tiValue) {
            fileContent = fileContent.replace(item, '"' + tiValue + '"')
        }
    })
    fs.writeFile(filePath, fileContent, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log(filePath + "文件替换完成！");
    })
}

function chineseFormatter(text) {
    return text.replace(/"/g, '')
}

function getI18nKey(chineseValue) {
    zhKeys = Object.keys(zhlangObj)
    let i18nKey = ""
    zhKeys.some(item => {
        if(zhlangObj[item] === chineseValue) {
            i18nKey = item
            return true
        } else {
            return false
        }
    })
    return i18nKey
}

function getTiValue(i18nKey) {
    if(i18nKey) {
        return tilangObj[i18nKey]
    } else {
        return ""
    }
    
}
let log = ''
function quchong() {
  const filterList = new Set()
  const keyList = Object.keys(zhlangObj)
  keyList.forEach(key => {
    if(filterList.has(zhlangObj[key])) {
      log += `删除   ${key}:${zhlangObj[key]}\n`
      delete zhlangObj[key];
    } else {
      filterList.add(zhlangObj[key])
    }
  })
  createChageLog()
}
/**
 * @description 根据modifyLog生成日志
 */
function createChageLog() {

  const logPath = './log/zh_new.js'
  let logContent = "module.exports = " + JSON.stringify(zhlangObj)
  fs.writeFile(path.join(__dirname, logPath), logContent, 'utf8', (err) => {
    if (err) {
    return console.error(err);
    }
    console.log("--------zh.js成功-----------")
  })
  fs.writeFile(path.join(__dirname, './log/zh_log.txt'), log, 'utf8', (err) => {
    if (err) {
    return console.error(err);
    }
    console.log("--------zh_log.txt成功-----------")
  })
}
/**
 * @description 读取ti文件内，未翻译的中文
 */
function readUntranslatedTi() {
    const tiFilePath = "D:/Workspace/YiLianZhong/person-service-mall/src/assets/js/lang/ti.js"
    let fileContent = fs.readFileSync(tiFilePath, 'utf8')
    const chineseArray = fileContent.match(/"([^"/]*[\u4E00-\u9FA5]{1,}[^"]*)+"/g)
    const newContent = chineseArray.join('\n')
    fs.writeFile('./demo/UntranslatedFile.txt', newContent, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log('' + tiFilePath + "文件未翻译文本读取完成！");
    })
}

quchong()
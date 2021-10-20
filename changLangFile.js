const path = require('path')
const fs = require('fs')

const filePath = "D:/Workspace/YiLianZhong/person-service-mall/src/assets/js/lang/ti.js"
const zhlangObj = require("D:/Workspace/YiLianZhong/hsa-pss-cw-nation/src/assets/js/lang/zh.js")
const tilangObj = require("D:/Workspace/YiLianZhong/hsa-pss-cw-nation/src/assets/js/lang/ti.js")

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

function quchong() {
    let fileContent = fs.readFileSync('./demo/chinese.txt', 'utf8')
    let yifanyi = fs.readFileSync('./demo/yifanyi.txt', 'utf8')
    const weifanyiArray = fileContent.split(',').map(item => {
        return item.replace('\r\n', '')
    })
    const yifanyiArray = yifanyi.split(',').map(item => {
        return item.replace('\r\n', '')
    })
    let yiSet = new Set(yifanyiArray)
    let chongdieArray = []
    let noChongdieArray = []
    weifanyiArray.forEach(item => {
        if(yiSet.has(item)) {
            chongdieArray.push(item)
        } else {
            noChongdieArray.push(item)
        }
    })
    console.log(noChongdieArray)
    console.log(chongdieArray)
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

// changFile()
// quchong()
readUntranslatedTi()
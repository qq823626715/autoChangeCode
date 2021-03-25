const path = require('path')
const fs = require('fs')

const filePath = "D:/Workspace/YiLianZhong/person-service-mall/src/assets/js/lang/ti.js"
const zhlangObj = require("D:/Workspace/YiLianZhong/hsa-pss-pw-nation-v2/src/assets/js/lang/zh.js")
const tilangObj = require("D:/Workspace/YiLianZhong/hsa-pss-pw-nation-v2/src/assets/js/lang/ti.js")

function changFile() {
    let fileContent = fs.readFileSync(filePath, 'utf8')
    const chineseArray = fileContent.match(/"([^"/]*[\u4E00-\u9FA5]{1,}[^"]*)+"/g)
    chineseArray.forEach((item, index) => {
        console.log('替换进度：' + index + '/' + chineseArray.length)
        const chineseValue = chineseFormatter(item)
        console.log(chineseValue)
        const i18nKey = getI18nKey(chineseValue)
        console.log('i18nKey：' + i18nKey)
        const tiValue = getTiValue(i18nKey)
        if(tiValue) {
            console.log('coming')
            fileContent = fileContent.replace(item, '"' + tiValue + '"')
        }
    })
    console.log(fileContent)
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

changFile()
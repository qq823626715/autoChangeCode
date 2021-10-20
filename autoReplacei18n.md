<!--
 * @Date: 2021-05-17 21:24:12
 * @LastEditTime: 2021-08-03 17:38:10
-->
# 国际化i18n Key自动替换脚本

## 一、 vue-i18n安装与基础使用
### __1. 安装__
```
npm install vue-i18n  
or  
yarn add vue-i18n  
```
> 注：如果有有使用```<i18n></i18n>```标签快，则需要安装vue-loader，vue-i18n-loader，并在webpack中增加配置
```
npm i --save-dev @kazupon/vue-i18n-loader
```
> vue-loader v15版本以上配置如下
```
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@kazupon/vue-i18n-loader'
      }
      // ...
    ]
  },
  // ...
}
```
> vue-loader v14版本以上配置如下
```
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // 你需要指定 `i18n` 的值为 `vue-i18n-loader`
            i18n: '@kazupon/vue-i18n-loader'
          }
        }
      },
      // ...
    ]
  },
  // ...
}
```
### __2. 基础使用__
#### __引入__
```
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

// 准备翻译的语言环境信息
// 文本没有单独存放时：
const messages = {
  en: {
    message: {
      hello: 'hello world'
    }
  },
  zh: {
    message: {
      hello: '你好、世界'
    }
  }
}
// 文本单独js文件存放时：
const messages = {
  en: require("@/assets/js/lang/en"),
  zh: require("@/assets/js/lang/zh")
}

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
  locale: 'zh', // 设置地区
  messages, // 设置地区信息
})


// 通过 `i18n` 选项创建 Vue 实例
new Vue({
  el: '#app',
  i18n,
  render: h => h(App)
})
```
#### __代码中使用__
在vue中使用之后，i18n会自动将```$t()```绑定到vue原型链上，可通过$t('对应的key')来展示对应的内容


对应的 zh.js
```
module.exports = {
  lang1: "中文1",
  lang2: "中文2",
  lang3: "中文3",
  lang4: "中文4",
}
```
vue文件template中使用
```
<p>{{$t('lang1')}}</p>
<el-input :placeholder="$t('lang2')"></el-input>
<el-form-item :label="$t('lang3')"></el-form-item>
...
```
vue文件script中使用，须在页面组件实例化之后，所以filters中不可用
```
methods: {
  fun() {
    return this.$t('lang1')
  }
}
...
```
在单独的js中，或没有vue，this实例的情况下  
在i18n初始化的js文件中将i18n的实例导出
```
const i18n = new VueI18n({
  locale: 'cn', // set locale
  messages: messages , // set locale messages
});
export default i18n;
```
在要使用i18n国际化的文件中导入该实例
```
//js文件中赋值
import i18n from 'i18n.js';
 
console.log(i18n.t('lang1'));
```
#### __更换语言环境__
```
this.$i18n.locale = 'zh'
或者
import i18n from 'i18n.js';
 
i18n.locale = 'zh'
```
> ps: 如果要更换根语言环境
```
this.$root.$i18n.locale = 'zh'
单独js文件中，自行导入vue实例
```

## 二、 自动替换脚本思路与实现
### __解决思路__
由上一章节，我们可以得知`i18n国际化插件`就是将需要国际化的文本内容替换成对应的`$t('key')`的形式。那么我们就可以遍历读取整个项目vue文件，找出国际化文本内容通过脚本匹配替换成对应的`$t('key')`  

### __具体实现__
通过node自带的文件模块fs来读写项目内文件   
```
const path = require('path')
const fs = require('fs')
const changeRules = require("./rules")
const { projectPath, zhLangFilePath, fileType, projectName } = require("./settings")
// 获取文件具体信息
const getPathInfo = p => path.parse(p)
// 输入日志内容
let modifyLog = []
```
settings.js 匹配文件
```
/**
 * @description 国际化，自动化配置
 * @param {String} projectPath 需要替换的的项目文件夹
 * @param {String} projectName 被替换的项目名，用于log文件命名
 * @param {String} zhLangFilePath 国际化，中文js
 * @param {Array} fileType 需要替换的文件类型
 */
const setting = {
    projectPath: 'D:/Workspace/YiLianZhong/nodeRelace/demo',
    projectName: 'Demo',
    zhLangFilePath: 'D:/Workspace/YiLianZhong/hsa-pss-cw-nation/src/assets/js/lang/zh.js',
    fileType: ['.vue'],
}

module.exports = setting
```
#### __1.递归获取项目文件__
```
const filesList = []
/**
 * @param {String} directory 文件目录
 * @param {Boolean} useSubdirectories 是否查询子目录，默认false
 * @param {array} extList 查询文件后缀，默认 ['.js']
 */
function readFileList(directory, useSubdirectories = false, extList = ['.js']) {
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
```
#### __2.循环文件列表__
* 读取文件内容
* 内容分割成template模块以及script模块
* 不同模块调用不同的替换规则
* 将替换后的内容覆盖到原文件
```
filesList.forEach((item, index) => {
  let fileName = item
  // 日志内容
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
  // 将原文件内容fileContent中符合template块以及script块用更新后的内容替换
  // replace使用function 解决文本中含有 $1 等特殊replace文本时bug
  fileContent = fileContent.replace(tempRge, () => {
    return templateContent
  })
  fileContent = fileContent.replace(scriptRge, () => {
    return scriptContent
  })
  // 替换后的文件内容写入
  fs.writeFile(item, fileContent, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log(item + "文件替换完成！");
  })
})
```
#### __3.替换内容为 i18n key__
前置文件 rules.js，存放替换文本使用的正则，以及替换后的文本模板
type：用于去除带中文的表达式
reg1， reg2，用来切割出表达式中的中文
sliceFlag：表达式的切割标志，: 或者 =
changeContent：中文表达式替换成带i18nKey表达式的模板
```
const changeRules = {
  //匹配第一种模式 <template></template>中的 abc="中文"  abc-abc='中文'等
  attrRule: {
    // 增加 少部分中英文掺杂文本判断，以及句尾（元）等单位判定
    type: /\b[\w-]+\s*=\s*("([\s\w\/（）\(\)]*[\u4E00-\u9FA5]{1,}[\s\w\/（）\(\)]*)+"|'([\s\w\/（）\(\)]*[\u4E00-\u9FA5]{1,}[\s\w\/（）\(\)]*)+')/g,
    reg1: /("([^"]*[\u4E00-\u9FA5]{1,}[^"]*)+")|('([^']*[\u4E00-\u9FA5]{1,}[^']*)+')/,
    reg2: /^"|^'|"$|'$/g,
    sliceFlag: "=",
    changeContent: function(keyContent, prefix) {
      return `:${prefix}="$t('${keyContent}')"`
    }
  },

  //匹配第二种模式  <template></template>中的>XXX<  > XXX <
  contentRule: {
    type: />([\s\w\/（）\(\)，！？]*[\u4E00-\u9FA5]{1,}[\s\w\/（）\(\)，！？]*)+</g,
    reg2: /^>[\s]*|[\s]*<$/g,
    changeContent: function(keyContent, elementFlag, prefix) {
      return `>{{ $t("${keyContent}") }}<`
    }
  },
  // 匹配第三种模式。<script></script>模块中的 "中文"或'中文'
  // 注意项目Eslint规则，需要 " 或 '
  scriptRule: {
    type: /(([^!=]=)|:|\(|\+)\s*(("([^"]*[\u4E00-\u9FA5]{1,}[^"]*)+")|('([^']*[\u4E00-\u9FA5]{1,}[^']*)+'))(?!\s*(!=|==)=?)/g,
    reg1: /(?<![\u4E00-\u9FA5])("([^"]*[\u4E00-\u9FA5]{1,}[^"]*)+")|('([^']*[\u4E00-\u9FA5]{1,}[^']*)+')/,
    reg2: /^"|^'|'$|"$/g,
    changeContent: function(keyContent, prefix) {
      return `${prefix} this.$t('${keyContent}')`
    }
  },

  scriptRuleOrigin: {
    type: /(?<!(!=|==)=?\s*)(("([\s\w\/（）\(\)，！？,]*[\u4E00-\u9FA5]{1,}[\s\w\/（）\(\)，！？]*)+")|('([\s\w\/（）\(\)，！？]*[\u4E00-\u9FA5]{1,}[\s\w\/（）\(\)，！？]*)+'))(?!\s*(!=|==)=?)/g,
    reg2:  /^"|^'|'$|"$/g,
    changeContent: function(keyContent) {
      return `this.$t('${keyContent}')`
    }
  }
}

module.exports = changeRules
```
文件内容替换 主函数
```
const zhlangObj = require(zhLangFilePath)
/**
 * @description 替换修改文件内容，并返回修改后的文件内容
 * @param {String} content 文件模块内容
 * @param {String} elementFlag 模块标签标志 标识当前文本属于哪个模块 template 或script
 * @param {String} rule 包含替换的各种规则以及切割标志 sliceFlag，用于标识前缀用“=”或“:”切割
 * reg1,reg2正则用于提取出正确的中文文本
 * @return {String} 替换后的文本内容
 * @time 2021/03/22
 * @author LiuShengRong
 */
function changFileContent(content, elementFlag, { type, reg1, reg2, changeContent, sliceFlag }) {
  // 搜索出所有符合规格的string
  let contentType = content.match(type)
  if (contentType && contentType.length > 0) {
    //去重
    // contentType = Array.from(new Set(contentType))
    for (let i = 0; i < contentType.length; i++) {
      //获取主要中文内容，用于替换
      let originContent = contentType[i]
      // 如果有切割标志，则切割字符串，获取前缀（label,title,placeholder等）
      let prefix = ""
      if (sliceFlag) {
        prefix = originContent.split(sliceFlag)[0].trim()
      }
      if(elementFlag === 'script') {
        if(originContent.indexOf('=') === 1) {
          prefix = originContent.slice(0,2)
        } else {
          prefix = originContent.slice(0,1)
        }
      }

      let chineseContent = ""
      if (!reg1) {
        chineseContent = originContent.replace(reg2, "").trim()
      } else {
        // 先用reg1确定中文文本范围 "中文"或 '中文'
        chineseContent = originContent.match(reg1)[0].trim().replace(reg2, "").trim()
      }
      const i18nKey = getI18nKey(chineseContent, zhlangObj)
      if (i18nKey) {
        content = content.replace(originContent, (target) => {
          const newText = changeContent(i18nKey, prefix)
          modifyLog.push(target + ' => ' + newText + '\n')
          return newText
        })
      }
    }
  }
  return content
}
```
获取对应的i18nKey的工具函数
```
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
```
#### __4.输出替换日志__
```
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
```  

## 三、 现存问题
* 1. 目前正则表达式只能替换vue文件，不能替换插件js，会报错，minxi可正确替换
* 2. 当vue文件中的filters内过滤函数被替换为this.$t('key')时，会报错，需要手动还原
* 3. 代码写法每个人难免多种多样，可能无法全部匹配替换，需手动全局搜索中文确认， 开启正则搜索 [\u4E00-\u9FA5]+ 即可查找中文
* 4. 日志输出没有替换过文本的文件目录依旧会被多余输出，影响查看

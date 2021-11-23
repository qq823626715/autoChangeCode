/*
 * @Author: LiuShengRong
 * @Date: 2021-10-20 11:21:54
 * @LastEditTime: 2021-10-20 15:47:05
 * @LastEditors: LiuShengRong
 * @Description: 读取中文文本
 */

const autoLoadFile = require('./readDirectoryFiles')
const readFileContent = require('./readFileContent')

function runReadChinese(directory, useSubdirectories = false, extList = ['.js']) {
  const fileList = autoLoadFile(directory, useSubdirectories, extList)
  readFileContent(fileList, 'App_Chinese_2')
}

runReadChinese('E:/Workspace/YiLianZhong/xizang/xz-app/src', true, ['.vue'])
/*
 * @Author: LiuShengRong
 * @Date: 2021-10-20 10:41:35
 * @LastEditTime: 2021-10-20 11:33:47
 * @LastEditors: LiuShengRong
 * @Description: 递归读取文件夹，文件对象存入数组
 */
const path = require('path')
const fs = require('fs')
//获取文件的具体信息
const getPathInfo = p => path.parse(p)

/**
 * @description: 
 * @param {String} directory 文件目录
 * @param {Boolean} useSubdirectories 是否查询子目录，默认false
 * @param {Array} extList 查询文件后缀，默认 ['.js']
 * @return {Array} 返回文件列表
 */
const autoLoadFile = function (directory, useSubdirectories = false, extList = ['.js']) {
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
  console.log("********递归文件读取完成**********")
  return filesList
}
module.exports = autoLoadFile
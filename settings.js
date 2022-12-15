/*
 * @Date: 2021-03-25 15:14:54
 * @LastEditors: LiuShengRong
 * @LastEditTime: 2021-11-23 09:44:45
 */
/**
 * @description 国际化，自动化配置
 * @param {String} projectPath 需要替换的的项目文件夹
 * @param {String} projectName 被替换的项目名，用于log文件命名
 * @param {String} zhLangFilePath 国际化，中文js
 * @param {Array} fileType 需要替换的文件类型
 */
const setting = {
    projectPath: 'E:/Workspace/YiLianZhong/qinghai/cw/src',
    projectName: '单位网厅双语同步',
    zhLangFilePath: 'E:/Workspace/YiLianZhong/qinghai/cw/src/assets/js/lang/zh.js',
    fileType: ['.vue'],
}

module.exports = setting
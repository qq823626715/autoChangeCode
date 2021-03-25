/**
 * @description 国际化，自动化配置
 * @param {String} projectPath 需要替换的的项目文件夹
 * @param {String} projectName 被替换的项目名，用于log文件命名
 * @param {String} zhLangFilePath 国际化，中文js
 * @param {Array} fileType 需要替换的文件类型
 */
const setting = {
    projectPath: 'D:/Workspace/YiLianZhong/person-service-mall/src',
    // projectPath: './demo',
    projectName: '门户网厅src',
    zhLangFilePath: 'D:/Workspace/YiLianZhong/person-service-mall/src/assets/js/lang/zh.js',
    // zhLangFilePath: './demo/zh.js',
    fileType: ['.vue'],
}

module.exports = setting
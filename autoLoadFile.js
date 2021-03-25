/**
 * @description: 获取文件中 引号住的中文
 * @param {*}
 * @return {*}
 * @author: syx
 */
const path = require('path')
const fs = require('fs')

//获取文件的具体信息
const getPathInfo = p => path.parse(p)

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
  //存放想要的中文数组
  let arr = []
  // 生成需要的对象
  const res = filesList.map(item => {
    const content = fs.readFileSync(item,'utf8')
    //匹配单引号包含中文  或者 双引号包含中文的 数据
    let result = String(content).match(/("\w*[\u4E00-\u9FA5]{1,}\w*")|('\w*[\u4E00-\u9FA5]{1,}\w*')/g)

    if (result&&result.length > 0) {
      result = result.map(item => {
        return item.replace(/\"|\'/g,"") + "\n"
      })
      arr = arr.concat(result)
    } 
    return result
  })
  //去重
  return Array.from(new Set(arr))
}

const fileList = autoLoadFile(path.join(__dirname, './langs'),true)
console.log(fileList)

fs.writeFile("result.js",fileList.join("") + "dadad法法dasdasd发顺丰".match(/[\u4E00-\u9FA5]{1,}/g).join(","),function(err) {
  if (err) {
      return console.error(err);
  }
  console.log("数据写入成功'拉拉'");
  console.log("--------我是分割线-------------")
  console.log("读取写入的数据！");
  fs.readFile('result.js', function (err, data) {
     if (err) {
        return console.error(err);
     }
     console.log("异步读取文件数据: " + data.toString());
  });
})


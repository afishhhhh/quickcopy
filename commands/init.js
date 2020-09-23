const process = require('process')
const fs = require('fs').promises
const path = require('path')
const ejs = require('ejs')

function renderFilePromisify(path, data) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(path, data, function(err, str) {
      if (err) {
        reject(err)
        return
      }
      resolve(str)
    })
  })
}

module.exports = async function init(projectName, appId) {
  if (!projectName) {
    console.warn('请输入项目名称 --name=projectname')
    return
  }

  if (!appId) {
    console.warn('请输入 appId --appid=appid')
    return
  }

  try {
    // 创建 config.project
    const configDirPath = path.join(process.cwd(), `config/config.${projectName}`)
    await fs.mkdir(configDirPath)
    // 写入 config.project/index.js
    const projectConfig = await renderFilePromisify(
      path.resolve(__dirname, '..', 'templates/config.index.js'),
      {}
    )
    await fs.writeFile(path.join(configDirPath, 'index.js'), projectConfig)
    // 写入 config.project/project.config.json
    const buf = await fs.readFile(`${process.cwd()}/project.config.json`)
    const { setting, libVersion = '2.7.3', condition = {} } = JSON.parse(buf.toString())
    const projectConfigJSON = await renderFilePromisify(
      path.resolve(__dirname, '..', 'templates/project.config.json'),
      { projectName, appId, libVersion }
    )
    await fs.writeFile(
      path.join(configDirPath, 'project.config.json'),
      projectConfigJSON
    )
    // 创建 src.project
    const srcDirPath = path.join(process.cwd(), `src/src.${projectName}`)
    await fs.mkdir(srcDirPath)
  } catch (err) {
    console.error(err)
  }
}

const process = require('process')
const fs = require('fs').promises
const path = require('path')
const ejs = require('ejs')
const prettier = require('prettier')
const extractConfig = require('../utils/extractConfig')

function renderFilePromisify(path, data) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(path, data, function (err, str) {
      if (err) {
        reject(err)
        return
      }
      resolve(str)
    })
  })
}

function getPrettierConfig(defaultOpts = {}) {
  return Object.assign(
    defaultOpts,
    prettier.resolveConfig.sync(process.cwd(), {
      useCache: true
      // editorconfig: true
    })
  )
}

function initCompilerConfig(configPath) {
  return extractConfig(path.join(process.cwd(), 'config/index.js'))
    .then(defineConstants =>
      renderFilePromisify(path.resolve(__dirname, '..', 'templates/config.index.js'), {
        defineConstants
      })
    )
    .then(compilerConfig => {
      const prettierOpts = getPrettierConfig({
        parser: 'babel'
      })
      return fs.writeFile(
        path.join(configPath, 'index.js'),
        prettier.format(compilerConfig, prettierOpts)
      )
    })
    .catch(err => Promise.reject(err))
}

function initProjectConfig(configPath, projectName, appId) {
  return fs
    .readFile(`${process.cwd()}/project.config.json`)
    .then(buffer => {
      const { setting, libVersion = '2.7.3', condition = {} } = JSON.parse(
        buffer.toString()
      )
      return renderFilePromisify(
        path.resolve(__dirname, '..', 'templates/project.config.json'),
        {
          projectName,
          appId,
          setting,
          libVersion,
          condition
        }
      )
    })
    .then(projectConfig => {
      const prettierOpts = getPrettierConfig({
        parser: 'json'
      })
      return fs.writeFile(
        path.join(configPath, 'project.config.json'),
        prettier.format(projectConfig, prettierOpts)
      )
    })
    .catch(err => Promise.reject(err))
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
    await initCompilerConfig(configDirPath)
    await initProjectConfig(configDirPath, projectName, appId)
    // 创建 src.project
    const srcDirPath = path.join(process.cwd(), `src/_src.${projectName}`)
    await fs.mkdir(srcDirPath)
  } catch (err) {
    console.error(err)
  }
}

const { promises: fs, existsSync, mkdirSync } = require('fs')
const path = require('path')
const prettier = require('prettier')
const {
  print,
  styledPath,
  done,
  success,
  warning,
  failed
} = require('../utils/printHelpers')
const renderFile = require('../utils/renderFile.promisify')
const resolvePrettierOpts = require('../utils/resolvePrettierOpts')
const resolveBuildConfig = require('../utils/resolveBuildConfig')

function initBuildConfig(configPath, projectName, sassResource) {
  const taroBuildConfigPath = './config/index.js'
  const distBuildConfigPath = path.join(configPath, 'index.js')

  return resolveBuildConfig({
    src: taroBuildConfigPath,
    opts: {
      project: projectName,
      sass: sassResource
    }
  })
    .then(({ patterns, resource, defineConstants }) => {
      print(
        '\n',
        done('读取 Taro 编译配置'),
        ' ',
        styledPath(path.resolve(taroBuildConfigPath))
      )
      return renderFile(
        path.join(__dirname, '..', 'templates/config-project/index.js'),
        { projectName, patterns, resource, defineConstants }
      )
    })
    .then(buildConfig => {
      print(done('解析 Taro 编译配置'))
      const prettierOpts = resolvePrettierOpts({
        parser: 'babel'
      })
      return fs.writeFile(
        distBuildConfigPath,
        prettier.format(buildConfig, prettierOpts)
      )
    })
    .then(() =>
      print(
        done(`为项目 ${projectName} 创建 Taro 编译配置`),
        ' ',
        styledPath(path.resolve(distBuildConfigPath))
      )
    )
}

function initProjectConfig(configPath, projectName, appId) {
  const distProjectConfigPath = path.join(configPath, 'project.config.json')

  return fs
    .readFile('./project.config.json')
    .then(buffer => {
      print(
        '\n',
        done('读取微信小程序项目配置'),
        ' ',
        styledPath(path.resolve('./project.config.json'))
      )
      const {
        setting,
        libVersion = '2.7.3',
        packOptions,
        debugOptions,
        watchOptions,
        scripts,
        condition = {}
      } = JSON.parse(buffer.toString())
      return renderFile(
        path.join(
          __dirname,
          '..',
          'templates/config-project/project.config.json'
        ),
        {
          projectName,
          appId,
          setting,
          libVersion,
          packOptions,
          debugOptions,
          watchOptions,
          scripts,
          condition
        }
      )
    })
    .then(projectConfig => {
      print(done('解析微信小程序项目配置'))
      const prettierOpts = resolvePrettierOpts({
        parser: 'json'
      })
      return fs.writeFile(
        distProjectConfigPath,
        prettier.format(projectConfig, prettierOpts)
      )
    })
    .then(() =>
      print(
        done(`为项目 ${projectName} 创建微信小程序项目配置`),
        ' ',
        styledPath(path.resolve(distProjectConfigPath))
      )
    )
}

function createThemeScss(projectName) {
  const dirs = ['src/style', 'src/styles', 'src/css']
  const dir = dirs.find(existsSync) || dirs[0]
  const themeDir = path.join(dir, 'themes')
  if (!existsSync(themeDir)) {
    mkdirSync(themeDir, {
      recursive: true
    })
  }
  const themeFilepath = path.join(themeDir, `${projectName}.scss`)
  return fs
    .writeFile(themeFilepath, `/* ${projectName} Theme */`)
    .then(() => themeFilepath)
}

module.exports = async function copy(projectName, appId) {
  if (!projectName) {
    print('\n', warning('请输入项目名称'), '\n\n', failed('copy 指令执行失败'))
    return
  }

  if (!appId) {
    print('\n', warning('请输入 appId'), '\n\n', failed('copy 指令执行失败'))
    return
  }

  const configDirPath = path.join('config', `config-${projectName}`)
  if (existsSync(configDirPath)) {
    print(
      '\n',
      warning(`项目 ${projectName} 已存在`),
      '\n\n',
      failed('copy 指令执行失败')
    )
    return
  }

  try {
    await fs.mkdir(configDirPath)
    const themeFilepath = await createThemeScss(projectName)
    await initBuildConfig(configDirPath, projectName, themeFilepath)
    await initProjectConfig(configDirPath, projectName, appId)

    print('\n', success('copy 指令执行完成'))
  } catch (err) {
    print('\n', err, '\n\n', failed('copy 指令执行失败'))
    // TODO: rm
  }
}

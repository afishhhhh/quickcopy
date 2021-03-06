import { promises as fs, existsSync, mkdirSync } from 'fs'
import path from 'path'
import prettier from 'prettier'
import {
  print,
  styledPath,
  done,
  success,
  warning,
  failed
} from '../utils/printHelpers'
import renderFile from '../utils/renderFile.promisify'
import resolveBuildConfig from '../utils/resolveBuildConfig'
import resolvePrettierOpts from '../utils/resolvePrettierOpts'

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
    .then(({ patterns, resource, defineConstants, requires }) => {
      print(
        '\n',
        done('读取 Taro 编译配置'),
        ' ',
        styledPath(path.resolve(taroBuildConfigPath))
      )
      return renderFile(
        path.join(__dirname, '../../', 'templates/build.config.js'),
        { projectName, patterns, resource, defineConstants, requires }
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
  const rootProjectConfigPath = './project.config.json'
  const distProjectConfigPath = path.join(configPath, 'project.config.json')

  return fs
    .readFile(rootProjectConfigPath)
    .then(buffer => {
      print(
        '\n',
        done('读取微信小程序项目配置'),
        ' ',
        styledPath(path.resolve(rootProjectConfigPath))
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
        path.join(__dirname, '../../', 'templates/project.config.json'),
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
  return fs.writeFile(themeFilepath, `/* ${projectName} Theme */`).then(() => {
    print(
      '\n',
      done(`为项目 ${projectName} 创建主题样式文件`),
      ' ',
      styledPath(path.resolve(themeFilepath))
    )
    return themeFilepath
  })
}

export default async function copy(projectName, appId) {
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

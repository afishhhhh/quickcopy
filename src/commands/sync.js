import { promises as fs, existsSync } from 'fs'
import path from 'path'
import {
  print,
  done,
  success,
  warning,
  failed,
  styledPath
} from '../utils/printHelpers'

function updateAllProjectConfig(configPaths, projectConfig) {
  return Promise.all(
    configPaths.reduce((init, filepath) => {
      if (!existsSync(filepath)) {
        print(
          warning('没有项目配置文件'),
          ' ',
          styledPath(path.resolve(filepath))
        )
        init.push(Promise.resolve())
      } else {
        init.push(
          fs
            .readFile(filepath)
            .then(buffer => {
              const {
                miniprogramRoot,
                projectname,
                description,
                appid
              } = JSON.parse(buffer.toString())
              const distProjectConfig = Object.assign({}, projectConfig, {
                miniprogramRoot,
                projectname,
                description,
                appid
              })
              return fs.writeFile(
                filepath,
                JSON.stringify(distProjectConfig, null, 2)
              )
            })
            .then(() =>
              print(
                done('项目配置文件已更新'),
                ' ',
                styledPath(path.resolve(filepath))
              )
            )
        )
      }
      return init
    }, [])
  )
}

function readRootProjectConfig() {
  const rootProjectConfigPath = './project.config.json'
  return fs.readFile(rootProjectConfigPath).then(buffer => {
    print(
      '\n',
      done('从根目录读取小程序项目配置 project.config.json'),
      ' ',
      styledPath(path.resolve(rootProjectConfigPath))
    )
    return buffer.toString()
  })
}

function getAllProjectPaths() {
  const configDirPath = './config'
  const isProjectConfigDir = dirent => {
    return dirent.isDirectory() && dirent.name.startsWith('config-')
  }
  return fs
    .readdir(configDirPath, {
      withFileTypes: true
    })
    .then(projectConfigDirs => {
      print('\n', done('查找 config 目录下所有项目'))
      return projectConfigDirs.reduce((init, dirent) => {
        if (isProjectConfigDir(dirent)) {
          init.push(
            path.join(configDirPath, dirent.name, 'project.config.json')
          )
        }
        return init
      }, [])
    })
}

export default async function sync(isAll = false) {
  const srcProjectConfig = await readRootProjectConfig()
  const parsedProjectConfig = JSON.parse(srcProjectConfig)
  if (isAll) {
    const projectPaths = await getAllProjectPaths()
    if (projectPaths.length == 0) {
      print(
        '\n',
        warning('config 目录下没有项目'),
        '\n\n',
        failed('sync 指令执行失败')
      )
      return
    }
    await updateAllProjectConfig(projectPaths, parsedProjectConfig)
    print('\n', success('sync 指令执行成功'))
    return
  }

  // 将 srcProjectConfig 更新至对应项目的目录下
  const { projectname } = parsedProjectConfig
  const distProjectConfigDirPath = path.join('config', `config-${projectname}`)
  if (!existsSync(distProjectConfigDirPath)) {
    print(
      '\n',
      warning(`项目 ${projectname} 不存在`),
      '\n\n',
      failed('sync 指令执行失败')
    )
    return
  }

  const distProjectConfigPath = path.join(
    distProjectConfigDirPath,
    'project.config.json'
  )
  if (!existsSync(distProjectConfigPath)) {
    print('\n', warning(`项目 ${projectname} 没有 project.config.json 文件`))
  }
  await fs.writeFile(
    distProjectConfigPath,
    JSON.stringify(parsedProjectConfig, null, 2)
  )
  print(
    '\n',
    done(`项目 ${projectname} 的 project.config.json 已更新`),
    ' ',
    styledPath(path.resolve(distProjectConfigPath)),
    '\n\n',
    success('sync 指令执行成功')
  )
}

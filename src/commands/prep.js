const process = require('process')
const { promises: fs, existsSync } = require('fs')
const path = require('path')
const {
  print,
  info,
  done,
  warning,
  failed,
  styledPath,
  success
} = require('../utils/printHelpers')
const renderFile = require('../utils/renderFile.promisify')

async function compareModifyTime(filepath, anotherFilepath) {
  const [stats, anotherStats] = await Promise.all([
    fs.stat(filepath),
    fs.stat(anotherFilepath)
  ])
  return stats.mtimeMs - anotherStats.mtimeMs >= 0 ? 1 : -1
}

function exportBuildConfig(projectName) {
  const distBuildExportPath = './config/build.export.js'

  return renderFile(
    path.join(__dirname, '../../', 'templates/build.export.js'),
    { projectName }
  )
    .then(exported => fs.writeFile(distBuildExportPath, exported))
    .then(() =>
      print(
        '\n',
        done(`创建导出文件, 导出项目 ${projectName} 的 Taro 编译配置`),
        ' ',
        styledPath(path.resolve(distBuildExportPath))
      )
    )
}

module.exports = async function prep(projectName) {
  if (!projectName) {
    print('\n', warning('请输入项目名称'), '\n\n', failed('prep 指令执行失败'))
    return
  }

  const configDirPath = path.join('config', `config-${projectName}`)
  const buildConfigPath = path.join(configDirPath, 'index.js')
  const projectConfigPath = path.join(configDirPath, 'project.config.json')
  for (const { filepath, error } of [
    { filepath: configDirPath, error: `项目 ${projectName} 不存在` },
    {
      filepath: buildConfigPath,
      error: `没有找到项目 ${projectName} 的 Taro 编译配置文件`
    },
    {
      filepath: projectConfigPath,
      error: `没有找到项目 ${projectName} 的微信小程序项目配置文件`
    }
  ]) {
    if (!existsSync(filepath)) {
      print('\n', warning(error), '\n\n', failed('prep 指令执行失败'))
      return
    }
  }

  try {
    // 导出编译配置
    await exportBuildConfig(projectName)
    // 拷贝项目配置到根目录
    const rootProjectConfigPath = './project.config.json'

    if (!existsSync(rootProjectConfigPath)) {
      print('\n', warning('根目录下没有 project.config.json 文件'))
      // 如果根目录下没有 project.config.json 则创建一个
      await fs.copyFile(projectConfigPath, rootProjectConfigPath)
      print(
        '\n',
        done(`复制项目 ${projectName} 的 project.config.json 至根目录`),
        '\n',
        styledPath(path.resolve(projectConfigPath)),
        '\n',
        styledPath(path.resolve(rootProjectConfigPath)),
        '\n\n',
        success('prep 指令执行完成')
      )
      return
    }

    const rootProjectConfig = (
      await fs.readFile(rootProjectConfigPath)
    ).toString()
    const { projectname: rootProjectName } = JSON.parse(rootProjectConfig)
    print(
      '\n',
      info(`根目录 project.config.json 的 projectname 是 ${rootProjectName}`)
    )

    if (projectName == rootProjectName) {
      let src = projectConfigPath
      let dist = rootProjectConfigPath
      if ((await compareModifyTime(dist, src)) == 1) {
        ;[src, dist] = [rootProjectConfigPath, projectConfigPath]
      }
      await fs.copyFile(src, dist)
      print(
        '\n',
        done('以下项目配置文件已同步更新：'),
        '\n',
        styledPath(path.resolve(src)),
        '\n',
        styledPath(path.resolve(dist)),
        '\n\n',
        success('prep 指令执行完成')
      )
      return
    }

    // 根目录 project.config.json 的 projectname 与 prep 不同
    const otherConfigDirPath = path.join('config', `config-${rootProjectName}`)
    // 如果根 project.config.json 项目存在
    if (existsSync(otherConfigDirPath)) {
      const src = rootProjectConfigPath
      const dist = path.join(otherConfigDirPath, 'project.config.json')
      if (!existsSync(dist) || (await compareModifyTime(src, dist)) == 1) {
        await fs.copyFile(src, dist)
        print(
          '\n',
          done('以下项目配置文件已同步更新：'),
          '\n',
          styledPath(path.resolve(src)),
          '\n',
          styledPath(path.resolve(dist))
        )
      }
    }

    await fs.copyFile(projectConfigPath, rootProjectConfigPath)
    print(
      '\n',
      done('以下项目配置文件已同步更新：'),
      '\n',
      styledPath(path.resolve(projectConfigPath)),
      '\n',
      styledPath(path.resolve(rootProjectConfigPath)),
      '\n\n',
      success('prep 指令执行完成')
    )
  } catch (err) {
    print('\n', err, '\n\n', failed('prep 指令执行失败'))
  }
}

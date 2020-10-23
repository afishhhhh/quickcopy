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
  return renderFile(path.join(__dirname, '..', 'templates/build.export.js'), {
    projectName
  })
    .then(exported =>
      fs.writeFile(path.join(process.cwd(), 'config/build.export.js'), exported)
    )
    .then(() =>
      print(
        '\n',
        done(`创建导出文件, 导出项目 ${projectName} 的 Taro 编译配置`),
        ' ',
        styledPath(path.join(process.cwd(), 'config/build.export.js'))
      )
    )
}

module.exports = async function ready(projectName) {
  if (!projectName) {
    print('\n', warning('请输入项目名称'), '\n\n', failed('ready 命令执行失败'))
    return
  }

  const configDirPath = path.join(
    process.cwd(),
    'config',
    `config-${projectName}`
  )
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
      print('\n', warning(error), '\n\n', failed('ready 命令执行失败'))
      return
    }
  }

  try {
    // 导出编译配置
    await exportBuildConfig(projectName)
    // 拷贝项目配置到根目录
    const rootProjectConfigPath = path.join(
      process.cwd(),
      'project.config.json'
    )
    if (!existsSync(rootProjectConfigPath)) {
      print('\n', warning('根目录下没有 project.config.json 文件'))
      // 如果根目录下没有 project.config.json 则创建一个
      await fs.copyFile(projectConfigPath, rootProjectConfigPath)
      print(
        '\n',
        done(`复制项目 ${projectName} 的 project.config.json 至根目录`),
        '\n',
        styledPath(projectConfigPath),
        '\n',
        styledPath(rootProjectConfigPath),
        '\n\n',
        success('ready 命令执行完成')
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
        styledPath(src),
        '\n',
        styledPath(dist),
        '\n\n',
        success('ready 命令执行完成')
      )
      return
    }

    // 根目录 project.config.json 的 projectname 与 ready 不同
    const otherConfigDirPath = path.join(
      process.cwd(),
      'config',
      `config-${rootProjectName}`
    )
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
          styledPath(src),
          '\n',
          styledPath(dist)
        )
      }
    }

    await fs.copyFile(projectConfigPath, rootProjectConfigPath)
    print(
      '\n',
      done('以下项目配置文件已同步更新：'),
      '\n',
      styledPath(projectConfigPath),
      '\n',
      styledPath(rootProjectConfigPath),
      '\n\n',
      success('ready 命令执行完成')
    )
  } catch (err) {
    print('\n', err, '\n\n', failed('ready 命令执行失败'))
  }
}

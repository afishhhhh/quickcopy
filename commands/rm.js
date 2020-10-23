const process = require('process')
const fs = require('fs').promises
const path = require('path')
const {
  print,
  warning,
  failed,
  done,
  success
} = require('../utils/printHelpers')

function isNoProjects() {
  const isProjectConfigDir = dirent => {
    return dirent.isDirectory() && dirent.name.startsWith('config-')
  }
  return fs
    .readdir(path.join(process.cwd(), 'config'), {
      withFileTypes: true
    })
    .then(projectDirs => !projectDirs.some(isProjectConfigDir))
}

module.exports = async function rm(projectName) {
  if (!projectName) {
    print('\n', warning('请输入项目名称'), '\n\n', failed('rm 命令执行失败'))
    return
  }

  try {
    await Promise.all(
      ['config', 'src'].map(dirname =>
        fs.rmdir(
          path.join(process.cwd(), dirname, `${dirname}-${projectName}`),
          { recursive: true }
        )
      )
    )
    if (await isNoProjects()) {
      await fs.unlink(path.join(process.cwd(), 'config', 'build.export.js'))
    }
    print(
      '\n',
      done(`项目 ${projectName} 已删除`),
      '\n\n',
      success('rm 命令执行成功')
    )
  } catch (err) {
    print('\n', err, '\n\n', failed('rm 命令执行失败'))
  }
}

import { promises as fs, existsSync } from 'fs'
import path from 'path'
import { print, warning, failed, done, success } from '../utils/printHelpers'

// TODO: rm dist

function isNoProjects() {
  const isProjectConfigDir = dirent => {
    return dirent.isDirectory() && dirent.name.startsWith('config-')
  }
  return fs
    .readdir('./config', {
      withFileTypes: true
    })
    .then(projectDirs => !projectDirs.some(isProjectConfigDir))
}

function removeConfigDir(project) {
  return fs.rmdir(path.join('config', `config-${project}`), {
    recursive: true
  })
}

function removeThemeScssFile(project) {
  const filepath = ['style', 'styles', 'css']
    .map(dirname => path.join('src', dirname, 'themes', `${project}.scss`))
    .find(filepath => existsSync(filepath))

  return fs
    .unlink(filepath)
    .then(() => fs.readdir(path.join(filepath, '..')))
    .then(files => {
      if (files.length == 0) {
        return fs.rmdir(path.join(filepath, '..'))
      }
    })
}

export default async function rm(projectName) {
  if (!projectName) {
    print('\n', warning('请输入项目名称'), '\n\n', failed('rm 指令执行失败'))
    return
  }

  try {
    await removeConfigDir(projectName)
    await removeThemeScssFile(projectName)

    const buildExportPath = 'config/build.export.js'
    if ((await isNoProjects()) && existsSync(buildExportPath)) {
      await fs.unlink(buildExportPath)
    }

    print(
      '\n',
      done(`项目 ${projectName} 已删除`),
      '\n\n',
      success('rm 指令执行成功')
    )
  } catch (err) {
    print('\n', err, '\n\n', failed('rm 指令执行失败'))
  }
}

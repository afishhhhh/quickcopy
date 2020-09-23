const process = require('process')
const fs = require('fs').promises
const path = require('path')

module.exports = async function rm(projectName) {
  if (!projectName) {
    console.warn('请输入项目名称 --name=projectname')
    return
  }

  try {
    await Promise.all([
      fs.rmdir(path.join(process.cwd(), `config/config.${projectName}`), {
        recursive: true
      }),
      fs.rmdir(path.join(process.cwd(), `src/src.${projectName}`), {
        recursive: true
      })
    ])
  } catch (err) {
    console.error(err)
  }
}

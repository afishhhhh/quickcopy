const fs = require('fs')
const path = require('path')

module.exports = ctx => {
  ctx.modifyBuildAssets(({ assets }) => {
    const icons = Object.keys(assets).filter(filepath =>
      filepath.endsWith('.png')
    )
    const { projectName } = ctx.initialConfig
    icons.forEach(filepath => {
      const src = path.join(
        'src',
        `${path.dirname(filepath)}-${projectName}`,
        path.basename(filepath)
      )
      if (fs.existsSync(src)) {
        assets[filepath] = {
          size: function () {
            return fs.statSync(src).size
          },
          source: function () {
            return fs.readFileSync(src)
          }
        }
      }
    })
  })
}

const process = require('process')
const prettier = require('prettier')

module.exports = function resolvePrettierOpts(defaultOpts = {}) {
  return Object.assign(
    defaultOpts,
    prettier.resolveConfig.sync(process.cwd(), {
      useCache: true
      // editorconfig: true
    })
  )
}

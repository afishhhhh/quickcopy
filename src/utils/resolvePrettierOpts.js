import process from 'process'
import prettier from 'prettier'

export default function resolvePrettierOpts(defaultOpts = {}) {
  return Object.assign(
    defaultOpts,
    prettier.resolveConfig.sync(process.cwd(), {
      useCache: true
      // editorconfig: true
    })
  )
}

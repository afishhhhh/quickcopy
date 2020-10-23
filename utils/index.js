const fs = require('fs').promises
const { parse } = require('@babel/parser')
const generate = require('@babel/generator').default

function getConfigByNames(configFilepath, configNames = []) {
  return fs.readFile(configFilepath).then(configCode => {
    const configAst = parse(configCode.toString()).program.body.find(
      node =>
        node.type == 'VariableDeclaration' &&
        node.declarations[0].type == 'VariableDeclarator' &&
        node.declarations[0].id.type == 'Identifier' &&
        node.declarations[0].id.name == 'config' &&
        node.declarations[0].init.type == 'ObjectExpression'
    )
    const defineConstantsAst = configAst.declarations[0].init.properties.find(
      node => node.key.type == 'Identifier' && node.key.name == 'defineConstants'
    )
    defineConstantsAst.value.properties = defineConstantsAst.value.properties.filter(
      node => node.key.type == 'Identifier' && node.key.name.startsWith('__')
    )

    const { code: defineConstantsCode } = generate(defineConstantsAst.value, {
      comments: false,
      minified: true,
      jsescOption: {
        minimal: true
      }
    })
    
    return defineConstantsCode
  })
}

module.exports = {
  getConfigByNames
}

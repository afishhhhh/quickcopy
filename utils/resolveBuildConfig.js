const fs = require('fs').promises
const path = require('path')
const process = require('process')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')
const t = require('@babel/types')

module.exports = function resolveBuildConfig(filepath, replacement) {
  return fs.readFile(filepath).then(buildConfig => {
    const ast = parse(buildConfig.toString())
    const { body } = ast.program
    const defineConstantsProperties = []
    const patternsElements = []
    const objectExpressionVisitor = {
      noScope: true,
      ObjectExpression({ node }) {
        const properties = node.properties.map(property => {
          const { name } = property.key
          let { value } = property.value
          if (name == 'to') {
            const splitedPath = path
              .relative(process.cwd(), value)
              .split(path.sep)
            if (splitedPath[0].startsWith('dist')) {
              splitedPath[0] = replacement.dist
              value = path.join(...splitedPath)
            }
          }
          // cloneNode
          return t.objectProperty(t.identifier(name), t.stringLiteral(value))
        })
        patternsElements.push(t.objectExpression(properties))
      }
    }
    const objectPropertyVisitor = {
      noScope: true,
      ObjectProperty({ node }) {
        const { name } = node.key
        if (name.startsWith('__')) {
          const key = t.identifier(name)
          const value = t.callExpression(
            t.memberExpression(t.identifier('JSON'), t.identifier('stringify')),
            node.value.arguments.map(node => t.cloneNode(node, true, false))
          )
          defineConstantsProperties.push(t.objectProperty(key, value))
        }
      }
    }

    const configDeclaration = body.find(
      item =>
        item.type == 'VariableDeclaration' &&
        item.declarations[0].id.name == 'config'
    )
    traverse(configDeclaration, {
      noScope: true,
      Identifier(_path) {
        if (_path.node.name == 'patterns') {
          _path.parentPath.traverse(objectExpressionVisitor)
        }
        if (_path.node.name == 'defineConstants') {
          _path.parentPath.traverse(objectPropertyVisitor)
        }
      }
    })

    const patternsAst = t.arrayExpression(patternsElements)
    const { code: patterns } = generate(patternsAst, {
      comments: false,
      // minified: true,
      jsescOption: {
        minimal: true
      }
    })

    const defineConstantsAst = t.objectExpression(defineConstantsProperties)
    const { code: defineConstants } = generate(defineConstantsAst, {
      comments: false,
      // minified: true,
      jsescOption: {
        minimal: true
      }
    })

    return { patterns, defineConstants }
  })
}

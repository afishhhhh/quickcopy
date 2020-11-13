const fs = require('fs').promises
const path = require('path')
const process = require('process')
const generate = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const { parse } = require('@babel/parser')
const t = require('@babel/types')

module.exports = function resolveBuildConfig({ src, opts }) {
  return fs.readFile(src).then(buildConfig => {
    const defineConstantsProperties = []
    const patternsElements = []
    const sassResources = []

    const patternVisitor = {
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
              splitedPath[0] = `dist-${opts.project}`
              value = path.join(...splitedPath)
            }
          }
          // cloneNode
          return t.objectProperty(t.identifier(name), t.stringLiteral(value))
        })
        patternsElements.push(t.objectExpression(properties))
      }
    }
    const defineConstantVisitor = {
      noScope: true,
      ObjectProperty({ node }) {
        const { name } = node.key
        if (name.startsWith('__')) {
          const key = t.identifier(name)
          // 不是 JSON.stringify
          const value = t.callExpression(
            t.memberExpression(t.identifier('JSON'), t.identifier('stringify')),
            node.value.arguments.map(node => t.cloneNode(node, false, true))
          )
          defineConstantsProperties.push(t.objectProperty(key, value))
        }
      }
    }

    const ast = parse(buildConfig.toString())
    const { body } = ast.program
    const configDeclaration = body.find(
      item =>
        item.type == 'VariableDeclaration' &&
        item.declarations[0].id.name == 'config'
    )
    traverse(configDeclaration, {
      noScope: true,
      Identifier(_path) {
        switch (_path.node.name) {
          case 'resource': {
            const { value } = _path.parent
            if (t.isArrayExpression(value)) {
              value.elements.forEach(el =>
                sassResources.push(t.cloneNode(el, false, true))
              )
            } else {
              sassResources.push(t.cloneNode(value, false, true))
            }
            break
          }
          case 'patterns':
            _path.parentPath.traverse(patternVisitor)
            break
          case 'defineConstants':
            _path.parentPath.traverse(defineConstantVisitor)
            break
          default:
            break
        }
      }
    })

    const generatorOpts = {
      comments: false,
      // minified: true,
      jsescOption: {
        minimal: true
      }
    }

    const [sass] = sassResources
    if (sass == void 0 || t.isCallExpression(sass)) {
      sassResources.unshift(
        t.callExpression(
          t.memberExpression(t.identifier('path'), t.identifier('resolve')),
          [
            t.identifier('__dirname'),
            t.stringLiteral('..'),
            t.stringLiteral(opts.sass)
          ]
        )
      )
    } else if (t.isStringLiteral(sass)) {
      sassResources.unshift(t.stringLiteral(opts.sass))
    }
    const resourceAst = t.arrayExpression(sassResources)
    const { code: resource } = generate(resourceAst, generatorOpts)

    const patternsAst = t.arrayExpression(patternsElements)
    const { code: patterns } = generate(patternsAst, generatorOpts)

    const defineConstantsAst = t.objectExpression(
      (defineConstantsProperties.push(
        t.objectProperty(
          t.identifier('__PROJECT'),
          t.callExpression(
            t.memberExpression(t.identifier('JSON'), t.identifier('stringify')),
            [t.stringLiteral(opts.project)]
          )
        )
      ),
      defineConstantsProperties)
    )
    const { code: defineConstants } = generate(
      defineConstantsAst,
      generatorOpts
    )

    return { patterns, resource, defineConstants }
  })
}

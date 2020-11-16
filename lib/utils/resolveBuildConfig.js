"use strict";

exports.__esModule = true;
exports.default = resolveBuildConfig;

var _fs = require("fs");

var _path2 = _interopRequireDefault(require("path"));

var _process = _interopRequireDefault(require("process"));

var _generator = _interopRequireDefault(require("@babel/generator"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _parser = require("@babel/parser");

var t = _interopRequireWildcard(require("@babel/types"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveBuildConfig({
  src,
  opts
}) {
  return _fs.promises.readFile(src).then(buildConfig => {
    const defineConstantsProperties = [];
    const patternsElements = [];
    const sassResources = [];
    const requires = [];
    const patternVisitor = {
      noScope: true,

      ObjectExpression({
        node
      }) {
        const properties = node.properties.map(property => {
          const {
            name
          } = property.key;
          let {
            value
          } = property.value;

          if (name == 'to') {
            const splitedPath = _path2.default.relative(_process.default.cwd(), value).split(_path2.default.sep);

            if (splitedPath[0].startsWith('dist')) {
              splitedPath[0] = `dist-${opts.project}`;
              value = _path2.default.join(...splitedPath);
            }
          } // cloneNode


          return t.objectProperty(t.identifier(name), t.stringLiteral(value));
        });
        patternsElements.push(t.objectExpression(properties));
      }

    };
    const defineConstantVisitor = {
      noScope: true,

      ObjectProperty({
        node
      }) {
        const {
          name
        } = node.key;

        if (name.startsWith('__')) {
          const key = t.identifier(name); // 不是 JSON.stringify

          const value = t.callExpression(t.memberExpression(t.identifier('JSON'), t.identifier('stringify')), node.value.arguments.map(node => t.cloneNode(node, false, true)));
          defineConstantsProperties.push(t.objectProperty(key, value));
        }
      }

    };
    const sassResourceVisitor = {
      noScope: true,

      StringLiteral(_path) {
        sassResources.push(t.cloneNode(_path.node, true, true));

        _path.skip();
      },

      CallExpression(_path) {
        const sassFilepath = _path2.default.join('/', ..._path.node.arguments.reduce((init, arg) => {
          if (t.isStringLiteral(arg)) {
            init.push(arg.value);
          }

          return init;
        }, []));

        sassResources.push(t.callExpression(t.memberExpression(t.identifier('path'), t.identifier('join')), [t.callExpression(t.memberExpression(t.identifier('process'), t.identifier('cwd')), []), t.stringLiteral(sassFilepath)]));

        _path.skip();
      }

    };
    const ast = (0, _parser.parse)(buildConfig.toString());
    const {
      body
    } = ast.program;
    const configDeclaration = body.find(item => item.type == 'VariableDeclaration' && item.declarations[0].id.name == 'config');
    (0, _traverse.default)(configDeclaration, {
      noScope: true,

      Identifier(_path) {
        switch (_path.node.name) {
          case 'resource':
            _path.parentPath.traverse(sassResourceVisitor);

            break;

          case 'patterns':
            _path.parentPath.traverse(patternVisitor);

            break;

          case 'defineConstants':
            _path.parentPath.traverse(defineConstantVisitor);

            break;

          default:
            break;
        }
      }

    });
    const generatorOpts = {
      comments: false,
      // minified: true,
      jsescOption: {
        minimal: true
      }
    };
    const [sass] = sassResources;

    if (sass == void 0 || t.isCallExpression(sass)) {
      sassResources.unshift(t.callExpression(t.memberExpression(t.identifier('path'), t.identifier('join')), [t.callExpression(t.memberExpression(t.identifier('process'), t.identifier('cwd')), []), t.stringLiteral(opts.sass)]));
      requires.push('path', 'process');
    } else if (t.isStringLiteral(sass)) {
      sassResources.unshift(t.stringLiteral(opts.sass));
    }

    const resourceAst = t.arrayExpression(sassResources);
    const patternsAst = t.arrayExpression(patternsElements);
    const defineConstantsAst = t.objectExpression((defineConstantsProperties.push(t.objectProperty(t.identifier('__PROJECT'), t.callExpression(t.memberExpression(t.identifier('JSON'), t.identifier('stringify')), [t.stringLiteral(opts.project)]))), defineConstantsProperties));
    return {
      requires,
      patterns: (0, _generator.default)(patternsAst, generatorOpts).code,
      resource: (0, _generator.default)(resourceAst, generatorOpts).code,
      defineConstants: (0, _generator.default)(defineConstantsAst, generatorOpts).code
    };
  });
}
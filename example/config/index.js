const path = require('path')

const config = {
  projectName: 'example-taro-2.x',
  date: '2020-11-15',
  designWidth: 750,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  babel: {
    sourceMap: true,
    presets: [
      [
        'env',
        {
          modules: false
        }
      ]
    ],
    plugins: [
      'transform-decorators-legacy',
      'transform-class-properties',
      'transform-object-rest-spread',
      [
        'transform-runtime',
        {
          'helpers': false,
          'polyfill': false,
          'regenerator': true,
          'moduleName': 'babel-runtime'
        }
      ]
    ]
  },
  // plugins: ['quickcopy/plugin-copy-assets'],
  copy: {
    patterns: [
      {
        from: 'src/assets/icons/icon1.png',
        to: 'dist/assets/icons/icon1.png'
      },
      {
        from: 'src/assets/icons/icon2.png',
        to: 'dist/assets/icons/icon2.png'
      }
    ]
  },
  defineConstants: {
    CONTENT: JSON.stringify('Hello world!'),
    __APP_NAME: JSON.stringify('示例1')
  },
  sass: {
    resource: path.resolve(__dirname, '..', 'src/style/mixins.scss')
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 10240 // 设定转换尺寸上限
        }
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'), require('./build.export'))
  }
  return merge({}, config, require('./prod'), require('./build.export'))
}

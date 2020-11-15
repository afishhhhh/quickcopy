const path = require('path')
const process = require('process')

module.exports = {
  projectName: 'example2',
  outputRoot: 'dist-example2',
  defineConstants: {
    __APP_NAME: JSON.stringify('示例1'),
    __PROJECT: JSON.stringify('example2')
  },
  copy: {
    patterns: [
      {
        from: 'src/assets/icons/icon1.png',
        to: 'dist-example2/assets/icons/icon1.png'
      },
      {
        from: 'src/assets/icons/icon2.png',
        to: 'dist-example2/assets/icons/icon2.png'
      }
    ]
  },
  sass: {
    resource: [
      path.join(process.cwd(), 'src/style/themes/example2.scss'),
      path.join(process.cwd(), '/src/style/mixins.scss')
    ]
  }
}

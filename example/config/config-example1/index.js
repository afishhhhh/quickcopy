const path = require('path')
const process = require('process')

module.exports = {
  projectName: 'example1',
  outputRoot: 'dist-example1',
  defineConstants: {
    __APP_NAME: JSON.stringify('示例1'),
    __PROJECT: JSON.stringify('example1')
  },
  copy: {
    patterns: [
      {
        from: 'src/assets/icons/icon1.png',
        to: 'dist-example1/assets/icons/icon1.png'
      },
      {
        from: 'src/assets/icons/icon2.png',
        to: 'dist-example1/assets/icons/icon2.png'
      }
    ]
  },
  sass: {
    resource: [
      path.join(process.cwd(), 'src/style/themes/example1.scss'),
      path.join(process.cwd(), '/src/style/mixins.scss')
    ]
  }
}

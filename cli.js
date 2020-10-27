const process = require('process')
const minimist = require('minimist')
const copy = require('./commands/copy')
const ready = require('./commands/ready')
const sync = require('./commands/sync')
const rm = require('./commands/rm')
const { print, warning } = require('./utils/printHelpers')

class CLI {
  run() {
    this.parseArgs()
  }

  parseArgs() {
    const args = minimist(process.argv.slice(2), {
      string: ['name', 'appid'],
      boolean: ['all', 'help', 'version'],
      alias: {
        help: ['h'],
        version: ['v']
      }
    })
    const { _, name } = args
    const cmd = _[0]
    if (cmd) {
      const projectName = _[1] || name
      switch (cmd) {
        case 'copy': {
          const appId = _[2] || args.appid
          copy(projectName, appId)
          break
        }
        case 'ready': {
          ready(projectName)
          break
        }
        case 'sync': {
          const isAll = args.all
          sync(isAll)
          break
        }
        case 'rm': {
          rm(projectName)
          break
        }
        default: {
          print('\n', warning('请输入正确的指令'))
          // process.exit(1)
          break
        }
      }
    } else {
      if (args.help || args.version) {
        const { version } = require('./package.json')
        print(
          '\n',
          `Quickcopy version: ${version}`,
          '\n\n',
          'Usage: qc <command> [options]',
          '\n\n',
          'Options:',
          '\n',
          '  -h --help                   查看使用说明',
          '\n',
          '  -v --version                查看版本信息',
          '\n\n',
          'Commands:',
          '\n',
          '  copy [projectName] [appId]  复制一个新的项目',
          '\n',
          '  ready [projectName]         执行编译前的准备工作',
          '\n',
          '  sync                        同步项目配置文件',
          '\n',
          '  rm [projectName]            移除一个项目'
        )
      }
    }
  }
}

module.exports = CLI

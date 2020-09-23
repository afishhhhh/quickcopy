const process = require('process')
const init = require('./commands/init')
const rm = require('./commands/rm')

class CLI {
  run() {
    this.parseArgs()
  }

  parseArgs() {
    const argMap = process.argv.slice(2).reduce((init, arg) => {
      const pair = arg.split('=', 2)
      if (pair.length == 1) {
        const cmds = init.cmds || []
        cmds.push(pair[0])
        init.cmds = cmds
      } else if (pair.length == 2) {
        init[pair[0]] = pair[1]
      }
      return init
    }, {})

    const cmd = argMap.cmds[0]
    switch (cmd) {
      case 'init': {
        const projectName = argMap['--name']
        const appId = argMap['--appid']
        init(projectName, appId)
        break
      }
      case 'rm': {
        const projectName = argMap['--name']
        rm(projectName)
        break
      }
      default:
        break
    }
  }
}

module.exports = CLI

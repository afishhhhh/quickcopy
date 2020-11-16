"use strict";

exports.__esModule = true;
exports.default = void 0;

var _process = _interopRequireDefault(require("process"));

var _minimist = _interopRequireDefault(require("minimist"));

var _copy = _interopRequireDefault(require("./commands/copy"));

var _prep = _interopRequireDefault(require("./commands/prep"));

var _sync = _interopRequireDefault(require("./commands/sync"));

var _rm = _interopRequireDefault(require("./commands/rm"));

var _printHelpers = require("./utils/printHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CLI {
  run() {
    this.parseArgs();
  }

  parseArgs() {
    const args = (0, _minimist.default)(_process.default.argv.slice(2), {
      string: ['name', 'appid'],
      boolean: ['all', 'help', 'version'],
      alias: {
        help: ['h'],
        version: ['v']
      }
    });
    const {
      _,
      name
    } = args;
    const cmd = _[0];

    if (cmd) {
      const projectName = _[1] || name;

      switch (cmd) {
        case 'copy':
          {
            const appId = _[2] || args.appid;
            (0, _copy.default)(projectName, appId);
            break;
          }

        case 'prep':
          {
            (0, _prep.default)(projectName);
            break;
          }

        case 'sync':
          {
            const isAll = args.all;
            (0, _sync.default)(isAll);
            break;
          }

        case 'rm':
          {
            (0, _rm.default)(projectName);
            break;
          }

        default:
          {
            (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('请输入正确的指令')); // TODO: process.exit(1)

            break;
          }
      }

      return;
    }

    const {
      version
    } = require('../package.json');

    if (args.help) {
      (0, _printHelpers.print)('\n', `Quickcopy version: ${version}`, '\n\n', 'Usage: qc <command> [options]', '\n\n', 'Options:', '\n', '  -h --help                   查看使用说明', '\n', '  -v --version                查看版本信息', '\n\n', 'Commands:', '\n', '  copy [projectName] [appId]  复制一个新的项目', '\n', '  prep [projectName]          执行编译前的准备工作', '\n', '  sync                        同步项目配置文件', '\n', '  rm [projectName]            移除一个项目');
      return;
    }

    if (args.version) {
      (0, _printHelpers.print)('\n', `Quickcopy version: ${version}`);
    }
  }

}

var _default = CLI;
exports.default = _default;
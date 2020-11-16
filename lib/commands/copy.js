"use strict";

exports.__esModule = true;
exports.default = copy;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _prettier = _interopRequireDefault(require("prettier"));

var _printHelpers = require("../utils/printHelpers");

var _renderFile = _interopRequireDefault(require("../utils/renderFile.promisify"));

var _resolveBuildConfig = _interopRequireDefault(require("../utils/resolveBuildConfig"));

var _resolvePrettierOpts = _interopRequireDefault(require("../utils/resolvePrettierOpts"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initBuildConfig(configPath, projectName, sassResource) {
  const taroBuildConfigPath = './config/index.js';

  const distBuildConfigPath = _path.default.join(configPath, 'index.js');

  return (0, _resolveBuildConfig.default)({
    src: taroBuildConfigPath,
    opts: {
      project: projectName,
      sass: sassResource
    }
  }).then(({
    patterns,
    resource,
    defineConstants,
    requires
  }) => {
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)('读取 Taro 编译配置'), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(taroBuildConfigPath)));
    return (0, _renderFile.default)(_path.default.join(__dirname, '../../', 'templates/build.config.js'), {
      projectName,
      patterns,
      resource,
      defineConstants,
      requires
    });
  }).then(buildConfig => {
    (0, _printHelpers.print)((0, _printHelpers.done)('解析 Taro 编译配置'));
    const prettierOpts = (0, _resolvePrettierOpts.default)({
      parser: 'babel'
    });
    return _fs.promises.writeFile(distBuildConfigPath, _prettier.default.format(buildConfig, prettierOpts));
  }).then(() => (0, _printHelpers.print)((0, _printHelpers.done)(`为项目 ${projectName} 创建 Taro 编译配置`), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(distBuildConfigPath))));
}

function initProjectConfig(configPath, projectName, appId) {
  const rootProjectConfigPath = './project.config.json';

  const distProjectConfigPath = _path.default.join(configPath, 'project.config.json');

  return _fs.promises.readFile(rootProjectConfigPath).then(buffer => {
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)('读取微信小程序项目配置'), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(rootProjectConfigPath)));
    const {
      setting,
      libVersion = '2.7.3',
      packOptions,
      debugOptions,
      watchOptions,
      scripts,
      condition = {}
    } = JSON.parse(buffer.toString());
    return (0, _renderFile.default)(_path.default.join(__dirname, '../../', 'templates/project.config.json'), {
      projectName,
      appId,
      setting,
      libVersion,
      packOptions,
      debugOptions,
      watchOptions,
      scripts,
      condition
    });
  }).then(projectConfig => {
    (0, _printHelpers.print)((0, _printHelpers.done)('解析微信小程序项目配置'));
    const prettierOpts = (0, _resolvePrettierOpts.default)({
      parser: 'json'
    });
    return _fs.promises.writeFile(distProjectConfigPath, _prettier.default.format(projectConfig, prettierOpts));
  }).then(() => (0, _printHelpers.print)((0, _printHelpers.done)(`为项目 ${projectName} 创建微信小程序项目配置`), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(distProjectConfigPath))));
}

function createThemeScss(projectName) {
  const dirs = ['src/style', 'src/styles', 'src/css'];
  const dir = dirs.find(_fs.existsSync) || dirs[0];

  const themeDir = _path.default.join(dir, 'themes');

  if (!(0, _fs.existsSync)(themeDir)) {
    (0, _fs.mkdirSync)(themeDir, {
      recursive: true
    });
  }

  const themeFilepath = _path.default.join(themeDir, `${projectName}.scss`);

  return _fs.promises.writeFile(themeFilepath, `/* ${projectName} Theme */`).then(() => {
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)(`为项目 ${projectName} 创建主题样式文件`), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(themeFilepath)));
    return themeFilepath;
  });
}

async function copy(projectName, appId) {
  if (!projectName) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('请输入项目名称'), '\n\n', (0, _printHelpers.failed)('copy 指令执行失败'));
    return;
  }

  if (!appId) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('请输入 appId'), '\n\n', (0, _printHelpers.failed)('copy 指令执行失败'));
    return;
  }

  const configDirPath = _path.default.join('config', `config-${projectName}`);

  if ((0, _fs.existsSync)(configDirPath)) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)(`项目 ${projectName} 已存在`), '\n\n', (0, _printHelpers.failed)('copy 指令执行失败'));
    return;
  }

  try {
    await _fs.promises.mkdir(configDirPath);
    const themeFilepath = await createThemeScss(projectName);
    await initBuildConfig(configDirPath, projectName, themeFilepath);
    await initProjectConfig(configDirPath, projectName, appId);
    (0, _printHelpers.print)('\n', (0, _printHelpers.success)('copy 指令执行完成'));
  } catch (err) {
    (0, _printHelpers.print)('\n', err, '\n\n', (0, _printHelpers.failed)('copy 指令执行失败')); // TODO: rm
  }
}
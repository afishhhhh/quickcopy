"use strict";

exports.__esModule = true;
exports.default = prep;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _printHelpers = require("../utils/printHelpers");

var _renderFile = _interopRequireDefault(require("../utils/renderFile.promisify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function compareModifyTime(filepath, anotherFilepath) {
  const [stats, anotherStats] = await Promise.all([_fs.promises.stat(filepath), _fs.promises.stat(anotherFilepath)]);
  return stats.mtimeMs - anotherStats.mtimeMs >= 0 ? 1 : -1;
}

function exportBuildConfig(projectName) {
  const distBuildExportPath = './config/build.export.js';
  return (0, _renderFile.default)(_path.default.join(__dirname, '../../', 'templates/build.export.js'), {
    projectName
  }).then(exported => _fs.promises.writeFile(distBuildExportPath, exported)).then(() => (0, _printHelpers.print)('\n', (0, _printHelpers.done)(`创建导出文件, 导出项目 ${projectName} 的 Taro 编译配置`), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(distBuildExportPath))));
}

async function prep(projectName) {
  if (!projectName) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('请输入项目名称'), '\n\n', (0, _printHelpers.failed)('prep 指令执行失败'));
    return;
  }

  const configDirPath = _path.default.join('config', `config-${projectName}`);

  const buildConfigPath = _path.default.join(configDirPath, 'index.js');

  const projectConfigPath = _path.default.join(configDirPath, 'project.config.json');

  for (const {
    filepath,
    error
  } of [{
    filepath: configDirPath,
    error: `项目 ${projectName} 不存在`
  }, {
    filepath: buildConfigPath,
    error: `没有找到项目 ${projectName} 的 Taro 编译配置文件`
  }, {
    filepath: projectConfigPath,
    error: `没有找到项目 ${projectName} 的微信小程序项目配置文件`
  }]) {
    if (!(0, _fs.existsSync)(filepath)) {
      (0, _printHelpers.print)('\n', (0, _printHelpers.warning)(error), '\n\n', (0, _printHelpers.failed)('prep 指令执行失败'));
      return;
    }
  }

  try {
    // 导出编译配置
    await exportBuildConfig(projectName); // 拷贝项目配置到根目录

    const rootProjectConfigPath = './project.config.json';

    if (!(0, _fs.existsSync)(rootProjectConfigPath)) {
      (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('根目录下没有 project.config.json 文件')); // 如果根目录下没有 project.config.json 则创建一个

      await _fs.promises.copyFile(projectConfigPath, rootProjectConfigPath);
      (0, _printHelpers.print)('\n', (0, _printHelpers.done)(`复制项目 ${projectName} 的 project.config.json 至根目录`), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(projectConfigPath)), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(rootProjectConfigPath)), '\n\n', (0, _printHelpers.success)('prep 指令执行完成'));
      return;
    }

    const rootProjectConfig = (await _fs.promises.readFile(rootProjectConfigPath)).toString();
    const {
      projectname: rootProjectName
    } = JSON.parse(rootProjectConfig);
    (0, _printHelpers.print)('\n', (0, _printHelpers.info)(`根目录 project.config.json 的 projectname 是 ${rootProjectName}`));

    if (projectName == rootProjectName) {
      let src = projectConfigPath;
      let dist = rootProjectConfigPath;

      if ((await compareModifyTime(dist, src)) == 1) {
        ;
        [src, dist] = [rootProjectConfigPath, projectConfigPath];
      }

      await _fs.promises.copyFile(src, dist);
      (0, _printHelpers.print)('\n', (0, _printHelpers.done)('以下项目配置文件已同步更新：'), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(src)), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(dist)), '\n\n', (0, _printHelpers.success)('prep 指令执行完成'));
      return;
    } // 根目录 project.config.json 的 projectname 与 prep 不同


    const otherConfigDirPath = _path.default.join('config', `config-${rootProjectName}`); // 如果根 project.config.json 项目存在


    if ((0, _fs.existsSync)(otherConfigDirPath)) {
      const src = rootProjectConfigPath;

      const dist = _path.default.join(otherConfigDirPath, 'project.config.json');

      if (!(0, _fs.existsSync)(dist) || (await compareModifyTime(src, dist)) == 1) {
        await _fs.promises.copyFile(src, dist);
        (0, _printHelpers.print)('\n', (0, _printHelpers.done)('以下项目配置文件已同步更新：'), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(src)), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(dist)));
      }
    }

    await _fs.promises.copyFile(projectConfigPath, rootProjectConfigPath);
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)('以下项目配置文件已同步更新：'), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(projectConfigPath)), '\n', (0, _printHelpers.styledPath)(_path.default.resolve(rootProjectConfigPath)), '\n\n', (0, _printHelpers.success)('prep 指令执行完成'));
  } catch (err) {
    (0, _printHelpers.print)('\n', err, '\n\n', (0, _printHelpers.failed)('prep 指令执行失败'));
  }
}
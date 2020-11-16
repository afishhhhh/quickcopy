"use strict";

exports.__esModule = true;
exports.default = sync;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _printHelpers = require("../utils/printHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateAllProjectConfig(configPaths, projectConfig) {
  return Promise.all(configPaths.reduce((init, filepath) => {
    if (!(0, _fs.existsSync)(filepath)) {
      (0, _printHelpers.print)((0, _printHelpers.warning)('没有项目配置文件'), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(filepath)));
      init.push(Promise.resolve());
    } else {
      init.push(_fs.promises.readFile(filepath).then(buffer => {
        const {
          miniprogramRoot,
          projectname,
          description,
          appid
        } = JSON.parse(buffer.toString());
        const distProjectConfig = Object.assign({}, projectConfig, {
          miniprogramRoot,
          projectname,
          description,
          appid
        });
        return _fs.promises.writeFile(filepath, JSON.stringify(distProjectConfig, null, 2));
      }).then(() => (0, _printHelpers.print)((0, _printHelpers.done)('项目配置文件已更新'), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(filepath)))));
    }

    return init;
  }, []));
}

function readRootProjectConfig() {
  const rootProjectConfigPath = './project.config.json';
  return _fs.promises.readFile(rootProjectConfigPath).then(buffer => {
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)('从根目录读取小程序项目配置 project.config.json'), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(rootProjectConfigPath)));
    return buffer.toString();
  });
}

function getAllProjectPaths() {
  const configDirPath = './config';

  const isProjectConfigDir = dirent => {
    return dirent.isDirectory() && dirent.name.startsWith('config-');
  };

  return _fs.promises.readdir(configDirPath, {
    withFileTypes: true
  }).then(projectConfigDirs => {
    (0, _printHelpers.print)('\n', (0, _printHelpers.done)('查找 config 目录下所有项目'));
    return projectConfigDirs.reduce((init, dirent) => {
      if (isProjectConfigDir(dirent)) {
        init.push(_path.default.join(configDirPath, dirent.name, 'project.config.json'));
      }

      return init;
    }, []);
  });
}

async function sync(isAll = false) {
  const srcProjectConfig = await readRootProjectConfig();
  const parsedProjectConfig = JSON.parse(srcProjectConfig);

  if (isAll) {
    const projectPaths = await getAllProjectPaths();

    if (projectPaths.length == 0) {
      (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('config 目录下没有项目'), '\n\n', (0, _printHelpers.failed)('sync 指令执行失败'));
      return;
    }

    await updateAllProjectConfig(projectPaths, parsedProjectConfig);
    (0, _printHelpers.print)('\n', (0, _printHelpers.success)('sync 指令执行成功'));
    return;
  } // 将 srcProjectConfig 更新至对应项目的目录下


  const {
    projectname
  } = parsedProjectConfig;

  const distProjectConfigDirPath = _path.default.join('config', `config-${projectname}`);

  if (!(0, _fs.existsSync)(distProjectConfigDirPath)) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)(`项目 ${projectname} 不存在`), '\n\n', (0, _printHelpers.failed)('sync 指令执行失败'));
    return;
  }

  const distProjectConfigPath = _path.default.join(distProjectConfigDirPath, 'project.config.json');

  if (!(0, _fs.existsSync)(distProjectConfigPath)) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)(`项目 ${projectname} 没有 project.config.json 文件`));
  }

  await _fs.promises.writeFile(distProjectConfigPath, JSON.stringify(parsedProjectConfig, null, 2));
  (0, _printHelpers.print)('\n', (0, _printHelpers.done)(`项目 ${projectname} 的 project.config.json 已更新`), ' ', (0, _printHelpers.styledPath)(_path.default.resolve(distProjectConfigPath)), '\n\n', (0, _printHelpers.success)('sync 指令执行成功'));
}
"use strict";

exports.__esModule = true;
exports.default = rm;

var _fs = require("fs");

var _path = _interopRequireDefault(require("path"));

var _printHelpers = require("../utils/printHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: rm dist
function isNoProjects() {
  const isProjectConfigDir = dirent => {
    return dirent.isDirectory() && dirent.name.startsWith('config-');
  };

  return _fs.promises.readdir('./config', {
    withFileTypes: true
  }).then(projectDirs => !projectDirs.some(isProjectConfigDir));
}

function removeConfigDir(project) {
  return _fs.promises.rmdir(_path.default.join('config', `config-${project}`), {
    recursive: true
  });
}

function removeThemeScssFile(project) {
  const filepath = ['style', 'styles', 'css'].map(dirname => _path.default.join('src', dirname, 'themes', `${project}.scss`)).find(filepath => (0, _fs.existsSync)(filepath));
  return _fs.promises.unlink(filepath).then(() => _fs.promises.readdir(_path.default.join(filepath, '..'))).then(files => {
    if (files.length == 0) {
      return _fs.promises.rmdir(_path.default.join(filepath, '..'));
    }
  });
}

async function rm(projectName) {
  if (!projectName) {
    (0, _printHelpers.print)('\n', (0, _printHelpers.warning)('请输入项目名称'), '\n\n', (0, _printHelpers.failed)('rm 指令执行失败'));
    return;
  }

  try {
    await removeConfigDir(projectName);
    await removeThemeScssFile(projectName);
    const buildExportPath = 'config/build.export.js';

    if ((await isNoProjects()) && (0, _fs.existsSync)(buildExportPath)) {
      await _fs.promises.unlink(buildExportPath);
    }

    (0, _printHelpers.print)('\n', (0, _printHelpers.done)(`项目 ${projectName} 已删除`), '\n\n', (0, _printHelpers.success)('rm 指令执行成功'));
  } catch (err) {
    (0, _printHelpers.print)('\n', err, '\n\n', (0, _printHelpers.failed)('rm 指令执行失败'));
  }
}
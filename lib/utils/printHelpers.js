"use strict";

exports.__esModule = true;
exports.styledPath = styledPath;
exports.info = info;
exports.done = done;
exports.success = success;
exports.warning = warning;
exports.failed = failed;
exports.print = print;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function styledPath(path) {
  return _chalk.default.white.underline(path);
}

function info(msg) {
  return _chalk.default.cyan(msg);
}

function done(msg) {
  return _chalk.default.green('✔ ', msg);
}

function success(msg) {
  return _chalk.default.green('🎉', msg);
}

function warning(msg) {
  return _chalk.default.white('⚠️ ', msg);
}

function failed(msg) {
  return _chalk.default.red('🤔', msg);
}

function print(...args) {
  console.log(args.join(''));
} // export default {
//   styledPath,
//   info,
//   done,
//   success,
//   warning,
//   failed,
//   print
// }
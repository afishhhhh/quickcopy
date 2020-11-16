"use strict";

exports.__esModule = true;
exports.default = resolvePrettierOpts;

var _process = _interopRequireDefault(require("process"));

var _prettier = _interopRequireDefault(require("prettier"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolvePrettierOpts(defaultOpts = {}) {
  return Object.assign(defaultOpts, _prettier.default.resolveConfig.sync(_process.default.cwd(), {
    useCache: true // editorconfig: true

  }));
}
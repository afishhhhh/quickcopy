"use strict";

exports.__esModule = true;
exports.default = renderFile;

var _ejs = _interopRequireDefault(require("ejs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderFile(path, data) {
  return new Promise((resolve, reject) => {
    _ejs.default.renderFile(path, data, function (err, str) {
      if (err) {
        reject(err);
        return;
      }

      resolve(str);
    });
  });
}
const ejs = require('ejs')

module.exports = function renderFile(path, data) {
  return new Promise((resolve, reject) => {
    ejs.renderFile(path, data, function (err, str) {
      if (err) {
        reject(err)
        return
      }
      resolve(str)
    })
  })
}
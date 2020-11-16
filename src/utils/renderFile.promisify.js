import ejs from 'ejs'

export default function renderFile(path, data) {
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
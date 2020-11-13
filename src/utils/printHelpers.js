const chalk = require('chalk')

function styledPath(path) {
  return chalk.white.underline(path)
}

function info(msg) {
  return chalk.cyan(msg)
}

function done(msg) {
  return chalk.green('✔ ', msg)
}

function success(msg) {
  return chalk.green('🎉', msg)
}

function warning(msg) {
  return chalk.white('⚠️ ', msg)
}

function failed(msg) {
  return chalk.red('🤔', msg)
}

function print(...args) {
  console.log(args.join(''))
}

module.exports = {
  styledPath,
  info,
  done,
  success,
  warning,
  failed,
  print
}

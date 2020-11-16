import chalk from 'chalk'

export function styledPath(path) {
  return chalk.white.underline(path)
}

export function info(msg) {
  return chalk.cyan(msg)
}

export function done(msg) {
  return chalk.green('✔ ', msg)
}

export function success(msg) {
  return chalk.green('🎉', msg)
}

export function warning(msg) {
  return chalk.white('⚠️ ', msg)
}

export function failed(msg) {
  return chalk.red('🤔', msg)
}

export function print(...args) {
  console.log(args.join(''))
}

// export default {
//   styledPath,
//   info,
//   done,
//   success,
//   warning,
//   failed,
//   print
// }

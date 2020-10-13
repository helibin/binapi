/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-20 14:53:23
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'
import log4js from 'log4js'
import CONFIG from 'config'
import Raven from 'raven'

/** 基础模块 */

/** 项目模块 */

/** 预处理 */
if (CONFIG.apiServer.sentryDSN) {
  Raven.config(CONFIG.apiServer.sentryDSN).install()
}

/**
 * 默认情况下:
 * 仅输出至控制台
 */

// level: [ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, MARK, OFF]
log4js.configure({
  appenders: {
    appLog: {
      type: ['prod', 'qa'].includes(process.env.NODE_ENV) ? 'file' : 'stdout',
      filename: 'logs/app.log',
      maxLogSize: 50 * 1024 * 1024, // 50M
      backups: 10,
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyMMdd.hhmmss} [%x{levelPrefix}] %m%]',
        tokens: {
          levelPrefix(logEvent) {
            return logEvent.level.levelStr.slice(0, 1)
          },
        },
      },
    },
    dayLog: {
      type: 'dateFile',
      filename: 'logs/day.log',
      pattern: '-yyyy-MM-dd',
      layout: {
        type: 'pattern',
        pattern: '%[%d{yyMMdd.hhmmss} [%x{levelPrefix}] %m%]',
        tokens: {
          levelPrefix(logEvent) {
            return logEvent.level.levelStr.slice(0, 1)
          },
        },
      },
      compress: true,
    },
  },
  categories: {
    default: {
      appenders: ['appLog', 'dayLog'],
      level: CONFIG.apiServer.logLevel.toLowerCase(),
    },
  },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID',
})

const logger = (...args) => {
  let logLevel = args.shift()

  if (!Object.keys(CONFIG.logLevels).includes(logLevel)) {
    logLevel = logLevel ? 'error' : 'info'
  }

  log4js.getLogger(logLevel)[logLevel](...args)
}

const sqlLog = (execSql, execTime) => {
  let logStr = `执行SQL语句: ${execSql}`
  if (typeof execTime === 'number') {
    logStr += ' => ' + chalk.green(`用时: ${execTime}ms`)
  }
  log4js.getLogger('Mysql    ').debug(logStr)
}

const rLog = ex => {
  Raven.captureException(ex, (err, eventId) => {
    if (err) {
      logger('error', `发送远程日志失败, err: ${err}`)
    } else {
      logger('error', `发送远程日志, eventId: ${eventId}`)
    }
  })
}

exports.logger = logger
exports.rLog = rLog
exports.sqlLog = sqlLog

// https://log4js-node.github.io/log4js-node/appenders.html

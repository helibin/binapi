/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-15 13:05:55
 */
/** 内建模块 */
import os from 'os';

/** 第三方模块 */
import chalk from 'chalk';
import log4js from 'log4js';
import CONFIG from 'config';
import Raven from 'raven';

/** 基础模块 */

/** 项目模块 */

/** 预处理 */
Raven.config(CONFIG.apiServer.sentryDSN).install();


/**
 * 默认情况下：
 * 仅输出至控制台
 */

// level: [ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, MARK, OFF]
log4js.configure({
  appenders: {
    out: {
      type      : CONFIG.env === 'production' ? 'file' : 'stdout',
      filename  : './logs/all.log',
      maxLogSize: 10240,
      backups   : 10,
    },
    access: {
      type    : 'dateFile',
      filename: './logs/access.log',
      pattern : '-yyyy-MM-dd',
      category: 'access',
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level    : CONFIG.apiServer.logLevel.toLowerCase(),
    },
    access: {
      appenders: ['access'],
      level    : 'debug',
    },
  },
  pm2: true,
});

let hostName = os.hostname();
hostName = hostName || hostName[0] || 'webServer';

const logger = (...args) => {
  let logLevel = args.shift();

  if (!Object.keys(CONFIG.logLevels).includes(logLevel)) {
    logLevel = logLevel ? 'error' : 'info';
  }

  log4js.getLogger(hostName)[logLevel](...args);
};

const Logger = {};
for (const logLevel of Object.keys(CONFIG.logLevels)) {
  Logger[logLevel] = (...args) => log4js.getLogger(hostName)[logLevel](...args);
}

Logger.sql = (execSql, execTime) => {
  let logStr = `执行SQL语句：${execSql}`;
  if (typeof execTime === 'number') {
    logStr += chalk.green(` => 用时：${execTime}ms`);
  }
  log4js.getLogger('Mysql.execDetail').debug(logStr);
};

const rLog = (ex) => {
  Raven.captureException(ex, (err, eventId) => {
    if (err) {
      Logger.error(`发送远程日志失败，err: ${err}`);
    } else {
      Logger.error(`发送远程日志，eventId: ${eventId}`);
    }
  });
};


export {
  Logger,
  logger,
  rLog,
};

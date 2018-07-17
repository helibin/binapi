/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-17 22:29:52
 */
/** 内建模块 */
import os from 'os';

/** 第三方模块 */
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

  if (!CONFIG.logLevels.includes(logLevel.toLowerCase())) {
    logLevel = logLevel ? 'error' : 'info';
  }

  log4js.getLogger(hostName)[logLevel](...args);
};

const Logger = {};
for (const logLevel of CONFIG.logLevels) {
  Logger[logLevel] = (...args) => log4js.getLogger(hostName)[logLevel](...args);
}

const rLog = (ex) => {
  Raven.captureException(ex, (err, eventId) => {
    if (err) {
      Logger.error(`发送远程日志失败，err: ${err}`);
    } else {
      Logger.error(`发送远程日志，eventId: ${eventId}`);
    }
  });
};


export default logger;
export {
  Logger,
  logger,
  rLog,
};

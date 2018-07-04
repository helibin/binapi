/** 内建模块 */
import os from 'os';

/** 第三方模块 */
import log4js from 'log4js';
import CONFIG from 'config';

/** 基础模块 */

/** 项目模块 */


const M = {};
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
  },
  categories: {
    default: {
      appenders: ['out'],
      level    : CONFIG.webServer.logLevel,
    },
  },
  pm2: true,
});

let hostName = os.hostname();
hostName = hostName || hostName[0] || 'webServer';

M.logger = (...args) => {
  let logLevel = args.shift();

  if (!CONFIG.logLevels.includes(logLevel)) {
    logLevel = logLevel ? 'error' : 'info';
  }

  log4js.getLogger(hostName)[logLevel](...args);
};

for (const logLevel of CONFIG.logLevels) {
  M[logLevel] = (...args) => log4js.getLogger(hostName)[logLevel](...args);
}


export default M.logger;
export { M as Logger  };

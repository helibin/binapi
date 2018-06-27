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
  appenders : { out: { type: 'stdout' } },
  categories: {
    default: {
      appenders: ['out'],
      level    : CONFIG.webServer.logLevel,
    },
  },
});

let hostName = os.hostname();
hostName = hostName || hostName[0] || 'webServer';

M.logger = (...args) => {
  let logLevel = args.shift();

  if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)) {
    logLevel = logLevel ? 'error' : 'info';
  }

  log4js.getLogger(hostName)[logLevel](...args);
};

for (const logLevel of ['trace', 'debug', 'info', 'warn', 'error', 'fatal']) {
  M[logLevel] = (...args) => log4js.getLogger(hostName)[logLevel](...args);
}


export default M.logger;
exports = M;

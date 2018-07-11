/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG,
  _e,
} from '../helper';

/** 项目模块 */


const M = {};

M.check = (options = {}) => async (ctx, next) => {
  const clientIP = ctx.state.clientIP;

  if (options.ipBlackList
    && options.ipBlackList !== '*'
    && options.ipBlackList.includes(clientIP)) {
    throw new _e('EClientBadRequest', 'accessDeniedByIPAdress', { clientIP });
  }
  if (options.ipWhiteList
    && options.ipWhiteList !== '*'
    && !options.ipWhiteList.includes(clientIP)) {
    throw new _e('EClientBadRequest', 'unTruestIPAdress', { clientIP });
  }

  await next();
};

M.allowAccess = (ipWhiteList = CONFIG.apiServer.ipWhiteList) => async (ctx, next) => {
  const clientIP = ctx.state.clientIP;

  if (ipWhiteList
    && ipWhiteList !== '*'
    && !ipWhiteList.includes(clientIP)) {
    throw new _e('EClientBadRequest', 'unTruestIPAdress', { clientIP });
  }

  await next();
};

M.denyAccess = (ipBlackList = CONFIG.apiServer.ipBlackList) => async (ctx, next) => {
  const clientIP = ctx.state.clientIP;

  if (ipBlackList
    && ipBlackList !== '*'
    && ipBlackList.includes(clientIP)) {
    throw new _e('EClientBadRequest', 'accessDeniedByIPAdress', { clientIP });
  }

  await next();
};

export default M;

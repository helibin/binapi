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
  if (options.ipBlackList
    && options.ipBlackList !== '*'
    && options.ipBlackList.includes(ctx.ip)) {
    throw new _e('EClientBadRequest', 'accessDeniedByIPAdress', { ip: ctx.ip });
  }
  if (options.ipWhiteList
    && options.ipWhiteList !== '*'
    && !options.ipWhiteList.includes(ctx.ip)) {
    throw new _e('EClientBadRequest', 'unTruestIPAdress', { ip: ctx.ip });
  }

  await next();
};

M.allowAccess = (ipWhiteList = CONFIG.apiServer.ipWhiteList) => async (ctx, next) => {
  if (ipWhiteList
    && ipWhiteList !== '*'
    && !ipWhiteList.includes(ctx.ip)) {
    throw new _e('EClientBadRequest', 'unTruestIPAdress', { ip: ctx.ip });
  }

  await next();
};

M.denyAccess = (ipBlackList = CONFIG.apiServer.ipBlackList) => async (ctx, next) => {
  if (ipBlackList
    && ipBlackList !== '*'
    && ipBlackList.includes(ctx.ip)) {
    throw new _e('EClientBadRequest', 'accessDeniedByIPAdress', { ip: ctx.ip });
  }

  await next();
};

export default M;

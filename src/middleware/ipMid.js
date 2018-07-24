/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-24 15:56:37
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';


/** 项目模块 */


export default new class extends Base {
  check(options = {}) {
    return async (ctx, next) => {
      const clientIP = ctx.state.clientIP;

      if (options.ipBlackList
      && options.ipBlackList !== '*'
      && options.ipBlackList.includes(clientIP)) {
        throw new this._e('EClientBadRequest', 'accessDeniedByIPAdress', { clientIP });
      }
      if (options.ipWhiteList
      && options.ipWhiteList !== '*'
      && !options.ipWhiteList.includes(clientIP)) {
        throw new this._e('EClientBadRequest', 'unTruestIPAdress', { clientIP });
      }

      await next();
    };
  }

  allowAccess(ipWhiteList = this.CONFIG.apiServer.ipWhiteList) {
    return  async (ctx, next) => {
      const clientIP = ctx.state.clientIP;

      if (ipWhiteList
      && ipWhiteList !== '*'
      && !ipWhiteList.includes(clientIP)) {
        throw new this._e('EClientBadRequest', 'unTruestIPAdress', { clientIP });
      }

      await next();
    };
  }

  denyAccess(ipBlackList = this.CONFIG.apiServer.ipBlackList) {
    return  async (ctx, next) => {
      const clientIP = ctx.state.clientIP;

      if (ipBlackList
      && ipBlackList !== '*'
      && ipBlackList.includes(clientIP)) {
        throw new this._e('EClientBadRequest', 'accessDeniedByIPAdress', { clientIP });
      }

      await next();
    };
  }
}();

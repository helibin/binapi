/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-27 15:11:33
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';


/** 项目模块 */


export default new class extends Base {
  allowAccess(ipWhiteList = this.CONFIG.apiServer.ipWhiteList) {
    if (!Array.isArray(ipWhiteList)) ipWhiteList = [ipWhiteList];
    return async (ctx, next) => {
      const clientIP = ctx.state.clientIP;

      if (!ipWhiteList.includes('*') && !ipWhiteList.includes(clientIP)) {
        throw new this._e('EClientBadRequest', 'unTruestIPAdress', { clientIP });
      }

      await next();
    };
  }

  denyAccess(ipBlackList = this.CONFIG.apiServer.ipBlackList) {
    return async (ctx, next) => {
      if (ipBlackList && !Array.isArray(ipBlackList)) ipBlackList = [ipBlackList];
      const clientIP = ctx.state.clientIP;

      if (ipBlackList
        && (ipBlackList.includes('*')
        || ipBlackList.includes(clientIP))) {
        throw new this._e('EClientBadRequest', 'accessDeniedByIPAdress', { clientIP });
      }

      await next();
    };
  }
}();

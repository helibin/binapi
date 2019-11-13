/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 09:46:33
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  allowAccess(ipWhiteList = this.CONFIG.apiServer.ipWhiteList) {
    if (!Array.isArray(ipWhiteList)) ipWhiteList = [ipWhiteList]
    return async (ctx, next) => {
      const clientIp = ctx.state.clientIp

      if (!ipWhiteList.includes('*') && !ipWhiteList.includes(clientIp)) {
        throw new this.ce('requestForbidden', 'unTruestIPAdress', {
          clientIp,
        })
      }

      await next()
    }
  }

  denyAccess(ipBlackList = this.CONFIG.apiServer.ipBlackList) {
    return async (ctx, next) => {
      if (ipBlackList && !Array.isArray(ipBlackList)) ipBlackList = [ipBlackList]
      const clientIp = ctx.state.clientIp

      if (ipBlackList && (ipBlackList.includes('*') || ipBlackList.includes(clientIp))) {
        throw new this.ce('requestForbidden', 'accessDeniedByIPAdress', {
          clientIp,
        })
      }

      await next()
    }
  }
})()

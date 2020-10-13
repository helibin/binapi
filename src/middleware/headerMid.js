/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-08-11 15:50:39
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  common() {
    return async (ctx, next) => {
      // 请求计时开始
      ctx.state.startTime = Date.now()
      await next()
    }
  }

  setCors() {
    const self = this
    return {
      origin: req => {
        const { header } = req
        const corsWhiteList = self.CONFIG.apiServer.corsWhiteList
        if (corsWhiteList === '*' || corsWhiteList.includes(header.origin)) {
          return header.origin
        }

        return false
      },
      expose: ['Date'],
      credentials: true,
      maxAge: this.CONFIG.webServer.maxAge,
    }
  }
})()

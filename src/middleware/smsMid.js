/*
 * @Author: helibin@139.com
 * @Date: 2018-10-12 11:05:04
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:55:45
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  getALYSMSCode(cate = 'default') {
    return async ctx => {
      const query = ctx.request.query
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSMSCode)
          return ctx.state.sendJSON(this.t.initRet({ code: '4'.padEnd(query.len, '4') }, 'okFromDebug'))
      } else if (this.CONFIG.webServer.skipSMSCode)
        return ctx.state.sendJSON(this.t.initRet({ code: '4'.padEnd(query.len, '4') }, 'okFromDebug'))

      try {
        await ctx.state.alySms.sendSMS(query.phone, query.cate || cate, query.len)

        ctx.state.sendJSON()
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }

  verifyALYSMSCode(cate = 'default') {
    return async (ctx, next) => {
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSMSCode) return next()
      } else if (this.CONFIG.webServer.skipSMSCode) return next()

      try {
        const { phone, code } = ctx.request.body
        const cacheKey = ctx.state.alySms.createCacheKey('alySms', cate, this.t.getMd5(ctx.userAgent.source), phone)

        const cacheCode = await ctx.state.redis.get(cacheKey)
        if (cacheCode !== code) throw new this.ce('invalidSMSCode', { code })

        await ctx.state.redis.del(cacheKey)
        ctx.state.logger('debug', `校验[${cate}]短信验证码成功：smsCode: ${code}`)

        return next()
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }
})()

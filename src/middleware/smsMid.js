/*
 * @Author: helibin@139.com
 * @Date: 2018-10-12 11:05:04
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-02 18:15:34
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  getHttpSmsCode(cate = 'default') {
    return async ctx => {
      const body = ctx.request.body
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSmsCode)
          return ctx.state.sendJSON(this.t.initRet({ code: '6'.padEnd(body.len || 4, '6') }, 'okFromDebug'))
      } else if (this.CONFIG.webServer.skipSmsCode)
        return ctx.state.sendJSON(this.t.initRet({ code: '6'.padEnd(body.len || 4, '6') }, 'okFromDebug'))

      try {
        await ctx.state.httpSms.sendSms(body.phone, body.cate || cate, body.len || 4)

        ctx.state.sendJSON()
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }

  verifyHttpSmsCode(cate = 'default') {
    return async (ctx, next) => {
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSmsCode) return next()
      } else if (this.CONFIG.webServer.skipSmsCode) return next()

      try {
        const { phone, code } = ctx.request.body
        const cacheKey = ctx.state.httpSms.createCacheKey(cate, this.t.getMd5(ctx.userAgent.source), phone)

        const cacheCode = await ctx.state.redis.get(cacheKey)
        if (cacheCode !== code) throw new this.ce('invalidSmsCode', { code })

        ctx.state.logger('debug', `校验[${cate}]短信验证码成功: smsCode: ${code}`)

        await next()
        ctx.state.redis.del(cacheKey)
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }

  getAlySmsCode(cate = 'default') {
    return async ctx => {
      const body = ctx.request.body
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSmsCode)
          return ctx.state.sendJSON(this.t.initRet({ code: '6'.padEnd(body.len || 4, '6') }, 'okFromDebug'))
      } else if (this.CONFIG.webServer.skipSmsCode)
        return ctx.state.sendJSON(this.t.initRet({ code: '6'.padEnd(body.len || 4, '6') }, 'okFromDebug'))

      try {
        await ctx.state.alySms.sendSms(body.phone, body.cate || cate, body.len || 4)

        ctx.state.sendJSON()
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }

  verifyAlySmsCode(cate = 'default') {
    return async (ctx, next) => {
      if (['signIn', 'signUp'].includes(cate)) {
        if (this.CONFIG.webServer.skipAuthSmsCode) return next()
      } else if (this.CONFIG.webServer.skipSmsCode) return next()

      try {
        const { phone, code } = ctx.request.body
        const cacheKey = ctx.state.alySms.createCacheKey(cate, this.t.getMd5(ctx.userAgent.source), phone)

        const cacheCode = await ctx.state.redis.get(cacheKey)
        if (cacheCode !== code) throw new this.ce('invalidSmsCode', { code })

        ctx.state.logger('debug', `校验[${cate}]短信验证码成功: smsCode: ${code}`)

        await next()
        ctx.state.redis.del(cacheKey)
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]短信验证码失败`)
        throw ex
      }
    }
  }
})()

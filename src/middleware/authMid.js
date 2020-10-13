/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-02 18:23:17
 */
/** 内建模块 */

/** 第三方模块 */
import Promise from 'bluebird'
import jwt from 'jsonwebtoken'

/** 基础模块 */
import CONFIG from 'config'
import Base from './base'

/** 项目模块 */
import { authCtrl } from '../controller'
import Mod from '../model'

/** 预处理 */
Promise.promisifyAll(jwt)

module.exports = new (class extends Base {
  xAuthToken() {
    return async (ctx, next) => {
      try {
        // 从HTTP header中获取
        if (CONFIG.webServer.xAuthHeader && ctx.headers[CONFIG.webServer.xAuthHeader]) {
          ctx.state.xAuthToken = ctx.headers[CONFIG.webServer.xAuthHeader]
        }

        // 从Query String中获取
        else if (CONFIG.webServer.xAuthQuery && ctx.query[CONFIG.webServer.xAuthQuery]) {
          ctx.state.xAuthToken = ctx.query[CONFIG.webServer.xAuthQuery]
        }

        // 从Cookie中获取
        else if (CONFIG.webServer.xAuthCookie && ctx.cookies.get(CONFIG.webServer.xAuthCookie)) {
          ctx.state.xAuthToken = ctx.cookies.get(CONFIG.webServer.xAuthCookie)
        }

        // 验证JWT并存储相关数据
        const xAuthTokenInfo = await jwt.verifyAsync(ctx.state.xAuthToken, this.CONFIG.webServer.secret).catch(() => {
          throw new this.ce('invalidXAuthToken', { x_auth_token: ctx.state.xAuthToken })
        })

        ctx.state.userId = xAuthTokenInfo.uid
        ctx.state.xatId = xAuthTokenInfo.xatId
        ctx.state.authType = xAuthTokenInfo.authType
      } catch (ex) {
        if (ex instanceof this.ce) {
          ctx.state.xAuthTokenErr = ex
          return
        }

        throw ex
      } finally {
        // 匿名访问
        if (this.t.isEmpty(ctx.state.xAuthToken) || !this.t.isEmpty(ctx.state.xAuthTokenErr)) {
          ctx.state.logger('info', `请求来自匿名用户: ${ctx.state.clientId}`)
        } else {
          ctx.state.logger('info', `请求来自用户: userId=${ctx.state.userId}`)
        }
        await next()
      }
    }
  }

  /**
   * 是否需要登录
   *
   * @param {string} allowAuthType 允许认证类型
   * @returns {*} null
   */
  requireSignIn() {
    return async (ctx, next) => {
      if (this.t.isEmpty(ctx.state.xAuthToken)) throw new this.ce('userNotSignedIn')

      if (!this.t.isEmpty(ctx.state.xAuthTokenErr)) {
        ctx.state.logger('error', '解析用户令牌出现异常: ', this.t.jsonStringify(ctx.state.xAuthTokenErr))
        throw ctx.state.xAuthTokenErr
      }

      // 刷新认证令牌
      await this._authTokenCheck(ctx)

      // 初始化用户信息
      await this._initUserInfo(ctx)

      await next()
    }
  }

  async _authTokenCheck(ctx) {
    try {
      const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(
        ctx.state.userId,
        ctx.state.authType,
        ctx.state.xatId,
        ctx.state.clientType,
      )

      // 服务器端验证xAuthToken
      const redisRes = await ctx.state.redis.get(xAuthTokenCacheKey)
      if (this.t.isEmpty(redisRes) || redisRes !== ctx.state.xAuthToken) {
        if (this.CONFIG.webServer.xAuthCookie) {
          ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, null)
        }

        throw new this.ce('xAuthTokenExpired', { x_auth_token: ctx.state.xAuthToken })
      }

      // 刷新xAuthToken, 如支持Cookie, 同时刷新Cookie
      if (ctx.state.authType === 'phone' && this.CONFIG.webServer.xAuthCookie) {
        ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, redisRes, {
          signed: true,
          httpOnly: false,
          expires: new Date(Date.now() + this.CONFIG.webServer.xAuthMaxAge[ctx.state.client] * 1000),
        })
      }
      await ctx.state.redis.run('expire', xAuthTokenCacheKey, this.CONFIG.webServer.xAuthMaxAge[ctx.state.clientType])
    } catch (ex) {
      ctx.state.logger('error', '解析用户令牌出现异常: ', this.t.jsonStringify(ex))

      throw ex
    }
  }

  // 初始化用户信息
  async _initUserInfo(ctx) {
    try {
      ctx.state.user = {}

      // 服务端获取完整用户信息并覆盖
      let dbRes = await Mod.muserMod.get(ctx, ctx.state.userId, { attributes: {} })
      if (this.t.isEmpty(dbRes)) {
        const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(
          ctx.state.userId,
          ctx.state.authType,
          ctx.state.xatId,
          ctx.state.clientType,
        )
        await ctx.state.redis.del(xAuthTokenCacheKey)

        throw new this.ce('noSuchUser', {
          user_id: ctx.state.userId,
        })
      }

      ctx.state.user = dbRes

      // 记录最后访问时间
      const nextData = { last_seen_at: Date.now() }
      await Mod.userMod.modify(ctx, ctx.state.userId, nextData)
    } catch (ex) {
      ctx.state.logger(ex, `初始化用户信息出错: `, JSON.stringify(ex))

      // 清空cookie
      if (this.CONFIG.webServer.xAuthCookie) {
        ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, null)
      }

      throw ex
    }
  }
})()

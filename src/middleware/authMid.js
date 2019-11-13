/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-08 11:57:24
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

        // 验证JWT并存储相关数据
        if (!this.t.isEmpty(ctx.state.xAuthToken)) {
          const xAuthTokenInfo = await jwt.verifyAsync(ctx.state.xAuthToken, this.CONFIG.webServer.secret).catch(() => {
            throw new this.ce('invalidXAuthToken', { x_auth_token: ctx.state.xAuthToken })
          })

          ctx.state.userId = xAuthTokenInfo.uid
          ctx.state.xatId = xAuthTokenInfo.xatId
          ctx.state.authType = xAuthTokenInfo.authType
          const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(
            xAuthTokenInfo.uid,
            ctx.state.authType,
            xAuthTokenInfo.xatId,
            ctx.state.clientType,
          )

          // 服务器端验证xAuthToken
          const redisRes = await ctx.state.redis.get(xAuthTokenCacheKey)
          if (this.t.isEmpty(redisRes) || redisRes !== ctx.state.xAuthToken) {
            throw new this.ce('xAuthTokenExpired', {
              x_auth_token: ctx.state.xAuthToken,
            })
          }

          await ctx.state.redis.run(
            'expire',
            xAuthTokenCacheKey,
            this.CONFIG.webServer.xAuthMaxAge[ctx.state.clientType],
          )
        }
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
      if (!this.t.isEmpty(ctx.state.xAuthTokenErr)) {
        ctx.state.logger('error', '解析用户令牌出现异常: ', this.t.jsonStringify(ctx.state.xAuthTokenErr))
        throw ctx.state.xAuthTokenErr
      }

      await this._initUserInfo(ctx)

      await next()
    }
  }

  /**
   * 验证权限
   *
   * @param {array} privilege 权限
   * @returns {*} null
   */
  requirePrivilege(...privilege) {
    return async (ctx, next) => {
      const privileges = ctx.state.user.privileges || ''
      if (privileges.trim() === '*') return await next()

      const privilegeArr = privileges.replace(' ', '').split(',')
      if (!privilegeArr.some(p => privilege.includes(p))) {
        throw new this.ce('noSuchPrivilege', { privilege })
      }

      await next()
    }
  }

  // 初始化用户信息
  async _initUserInfo(ctx) {
    try {
      ctx.state.user = {}
      if (this.t.isEmpty(ctx.state.xAuthToken) || !this.t.isEmpty(ctx.state.xAuthTokenErr)) {
        throw new this.ce('userNotSignedIn')
      }

      // 服务端获取完整用户信息并覆盖
      let dbRes = await Mod.muserMod.run(ctx, 'get', ctx.state.userId, { attributes: {} })
      if (this.t.isEmpty(dbRes)) {
        const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(
          ctx.state.uid,
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

      throw ex
    }
  }
})()

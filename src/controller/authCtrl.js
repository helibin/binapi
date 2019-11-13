/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-06 15:47:45
 */
/** 内建模块 */

/** 第三方模块 */
import jwt from 'jsonwebtoken'
import dayjs from 'dayjs'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async createAuthCacheKey(
    userId = '*',
    authType = 'web',
    xAuthTokenId = '*',
    clientType = '*',
    userType = this.CONFIG.webServer.name,
  ) {
    return `token@xAuthToken#:userType=${userType}:authType=${authType}:clientType=${clientType}:userId=${userId}:xAuthTokenId=${xAuthTokenId}`
  }

  /**
   *
   * @param {object} ctx 上下文
   * @param {string} uid 用户ID
   * @param {string} authType=[web] 认证类型（web|ak）
   * @param {string} clientType=[desktop] 客户端类型（desktop|mobile）
   * @param {string} userType 用户类型（www|manage）
   * @param {string} [xatId] 令牌ID
   * @returns {string} xAuthToken
   */
  async genXAuthToken(
    ctx,
    uid,
    authType = 'web',
    clientType = 'desktop',
    userType = this.CONFIG.webServer.name,
    xatId,
  ) {
    if (authType === 'ak') {
      xatId = `xat_${xatId}` // AK 强制单点登录
    } else {
      xatId = this.CONFIG.webServer.singleSignIn ? `xat_${uid}` : `xat_${this.t.genUUID()}` // 单点登录判断
    }

    const xAuthTokenInfo = {
      uid,
      xatId,
      clientType,
      userType,
      authType,
    }

    const xAuthTokenCacheKey = await this.createAuthCacheKey(uid, authType, xatId, clientType, userType)
    const xAuthToken = jwt.sign(xAuthTokenInfo, this.CONFIG.webServer.secret)
    await ctx.state.redis.set(xAuthTokenCacheKey, xAuthToken, this.CONFIG.webServer.xAuthMaxAge[clientType])

    return {
      x_auth_token: xAuthToken,
      expires_in: this.CONFIG.webServer.xAuthMaxAge[clientType],
    }
  }

  async signIn(ctx) {
    const ret = this.t.initRet()
    const body = ctx.request.body

    // 用户登录校验
    const whereOpt = {
      $or: {
        identifier: body.identifier,
        phone: body.identifier,
        email: body.identifier,
      },
    }
    const userRes = await Mod.muserMod.get(ctx, whereOpt, { attributes: {} })
    if (this.t.isEmpty(userRes)) {
      throw new this.ce('noSuchMuser', { identifier: body.identifier })
    }
    if (userRes.password !== this.t.getSaltedHashStr(body.password.toUpperCase(), userRes.id)) {
      throw new this.ce('invildUsenameOrPassowrd')
    }

    // 发放令牌
    const tokenInfo = await this.genXAuthToken(ctx, userRes.id, 'web', ctx.state.clientType)

    // 记录最后登录时间
    await Mod.muserMod.modify(ctx, userRes.id, { last_sign_at: Date.now() })

    // 准备响应数据
    ret.data = this.t.safeData(userRes)
    ret.data = { ...ret.data, ...tokenInfo }

    Mod.actionLogMod.run(ctx, 'addData', 'signIn', '登录', userRes.name || userRes.identifier)

    // 打印日志并返回数据
    ctx.state.logger('debug', `用户登录: muserId=${userRes.id}`)
    ctx.state.sendJSON(ret)
  }

  async signOut(ctx) {
    // 回收token
    const xAuthTokenCacheKey = await this.createAuthCacheKey(
      ctx.state.userId,
      'web',
      ctx.state.xAuthTokenId,
      ctx.state.clientType,
    )
    await ctx.state.redis.del(xAuthTokenCacheKey)

    ctx.state.logger('debug', `用户登出：muserId=${ctx.state.userId}`)
    ctx.state.sendJSON()
  }

  async resetPassword(ctx) {
    const body = ctx.request.body

    const authRes = await Mod.authMod.get(ctx, { identifier: body.phone })
    if (this.t.isEmpty(authRes)) {
      throw new this.ce('noSuchIdentifier', {
        identifier: body.identifier,
      })
    }

    const nextData = {
      password: this.t.getSaltedHashStr(body.password.toUpperCase(), authRes.user_id),
    }
    await Mod.userMod.modify(ctx, authRes.user_id, nextData)

    // 非登录状态回收所有令牌
    if (!ctx.state.userId) {
      const xAuthTokenCacheKey = await this.createAuthCacheKey(authRes.user_id)
      await ctx.state.redis.del(xAuthTokenCacheKey)
    }

    ctx.state.logger('debug', `重置密码：targetId=${authRes.user_id}`, body)
    ctx.state.sendJSON()
  }

  async applySTSDownloadToken(ctx) {
    const ret = this.t.initRet()
    const { cate } = ctx.query
    const stsToken = await ctx.state.alyOss.getSTSDownloadToken(cate || 'media')

    ret.data = { sts_token: stsToken }
    ctx.state.sendJSON(ret)
  }
})()

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:17:25
 */
/** 内建模块 */
import fs from 'fs'

/** 第三方模块 */
import jwt from 'jsonwebtoken'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'
import Ctrl from '.'

module.exports = new (class extends Base {
  async createAuthCacheKey(
    userId = '*',
    authType = 'wechat.mp',
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
   * @param {string} authType=[wechat.mp] 认证类型(CONST.authType)
   * @param {string} clientType=[desktop] 客户端类型(CONST.clientType)
   * @param {string} userType 用户类型(www|manage)
   * @param {string} [xatId] 令牌ID
   * @returns {string} xAuthToken
   */
  async genXAuthToken(
    ctx,
    uid,
    authType = 'wechat.mp',
    clientType = ctx.state.clientType,
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
        user_id: body.identifier,
        identifier: body.identifier,
      },
      type: 'account',
    }
    // 用户登录校验
    const authRes = await Mod.authMod.get(ctx, whereOpt)
    if (this.t.isEmpty(authRes)) {
      throw new this.ce('EUserAuth', 'noSuchIdentifier', { identifier: body.identifier })
    }

    // 准备用户信息
    const userRes = await Mod.userMod.run(ctx, 'getData', authRes.user_id, { noPassword: false, type: 'account' })
    if (this.t.isEmpty(userRes)) {
      throw new this.ce('noSuchUser', { user_id: authRes.user_id })
    }

    // TODO 开启密码校验
    // const passwordHash = this.t.getSaltedHashStr(body.password.toUpperCase(), authRes.user_id)
    // if (passwordHash !== userRes.password.toUpperCase()) {
    //   throw new this.ce('invildUsenameOrPassowrd')
    // }

    // 发放令牌
    const tokenInfo = await this.genXAuthToken(ctx, userRes.id, 'phone')

    // 记录最后登录时间
    await Mod.userMod.modify(ctx, userRes.id, { last_sign_at: Date.now() })

    // 准备响应数据
    ret.data = this.t.safeData(userRes)
    ret.data = { ...ret.data, ...tokenInfo }

    // 打印日志并返回数据
    ctx.state.logger('debug', `用户登录: muserId=${userRes.id}`)
    ctx.state.sendJSON(ret)
  }

  async signInByOAuth(ctx) {
    const ret = this.t.initRet()
    const { app = 'wechat.mp' } = ctx.request.body

    let oAuthInfo = {}
    if (app === 'wechat.mp') {
      oAuthInfo = await Ctrl.wechatCtrl.signInByMp(ctx, true)
      oAuthInfo.type = 'wechat'
      oAuthInfo.from = 'wechat.mp'
    }

    if (app === 'wechat.oa') {
      oAuthInfo = await Ctrl.wechatCtrl.signInByOa(ctx, true)
      oAuthInfo.type = 'wechat'
      oAuthInfo.from = 'wechat.oa'
    }

    if (app === 'wechat.app') {
      oAuthInfo = await Ctrl.wechatCtrl.signInByApp(ctx, true)
      oAuthInfo.type = 'wechat'
      oAuthInfo.from = 'wechat.app'
    }

    if (app === 'apple') {
      oAuthInfo = await this._signInByApple(ctx, true)
      oAuthInfo.type = 'apple'
      oAuthInfo.from = 'apple.app'
    }

    const oAuthData = {
      type: oAuthInfo.type,
      from: oAuthInfo.from,
      identifier: oAuthInfo.identifier,
      unique_id: oAuthInfo.unique_id,
      auth_info: oAuthInfo.auth_info,
    }
    const { userId, isNewUser } = await Mod.authMod.run(ctx, 'signInByOAuth', oAuthData)

    // 发放令牌
    const xAuthToken = await this.genXAuthToken(ctx, userId)

    // 记录最后登录时间
    await Mod.userMod.modify(ctx, userId, { last_sign_at: Date.now() })

    // 返回用户信息
    const userRes = await Mod.userMod.run(ctx, 'getData', userId)

    ret.data = { ...userRes, ...xAuthToken }

    ctx.state.logger(
      'debug',
      `${oAuthData.type}第三方登录: identifier=${oAuthData.identifier}`,
      `是否首次登录: ${isNewUser}`,
    )
    ctx.state.sendJSON(ret)
  }

  /**
   * Sign in with Apple（苹果授权登陆）
   *
   * userID、email、fullName、authorizationCode、identityToken
   *
   * identityToken = {
   *   "iss":"https://appleid.apple.com",  // 苹果签发的标识
   *   "aud":"com.example.xxx", // 接收者的APP ID
   *   "exp":1565668086, "iat":1565667486, "auth_time":1565667486,
   *   "sub":"001247.93b3a799a7c84c0cb46cd08f100797f2.0704", //用户的唯一标识
   *   "c_hash":"Oh2am9eMNWVY3dq5JmClbg",
   * }
   */
  async _signInByApple(ctx, callback) {
    const { edata } = ctx.query

    const cert = fs.readFileSync(path.resolve(__dirname, this.CONFIG.appleServer.certPath))
    const tokenInfo = jwt.verifyAsync(edata, cert).catch(ex => {
      throw new this._e('EOpenAPI', 'appleOAuthFailed', ex)
    })

    return {
      identifier: tokenInfo.sub,
      unique_id: tokenInfo.sub,
      auth_info: tokenInfo,
    }
  }

  async signOut(ctx) {
    const { app } = ctx.query
    // 回收token
    const xAuthTokenCacheKey = await this.createAuthCacheKey(
      ctx.state.userId,
      app || 'phone',
      ctx.state.xAuthTokenId,
      ctx.state.clientType,
    )
    await ctx.state.redis.del(xAuthTokenCacheKey)

    // 清除cookie
    if (this.CONFIG.webServer.xAuthCookie) {
      ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, null)
    }

    ctx.state.logger('debug', `用户登出: muserId=${ctx.state.userId}`)
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

    ctx.state.logger('debug', `重置密码: targetId=${authRes.user_id}`, body)
    ctx.state.sendJSON()
  }
})()

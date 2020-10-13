/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:13:57
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:29:14
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  /**
   * 微信小程序登录
   *
   * UnionID获取途径
   *   1. 调用接口 wx.getUserInfo, 从解密数据中获取 UnionID。注意本接口需要用户授权, 请开发者妥善处理用户拒绝授权后的情况。
   *   2. 如果开发者帐号下存在同主体的公众号, 并且该用户已经关注了该公众号。开发者可以直接通过 wx.login + code2Session 获取到该用户 UnionID, 无须用户再次授权。
   *   3. 如果开发者帐号下存在同主体的公众号或移动应用, 并且该用户已经授权登录过该公众号或移动应用。开发者也可以直接通过 wx.login + code2Session 获取到该用户 UnionID , 无须用户再次授权。
   *   4. 用户在小程序（暂不支持小游戏）中支付完成后, 开发者可以直接通过getPaidUnionId接口获取该用户的 UnionID, 无需用户授权。注意：本接口仅在用户支付完成后的5分钟内有效, 请开发者妥善处理。
   */
  async signInByMp(ctx, isCallback) {
    const ret = this.t.initRet()
    const { code, edata, iv } = ctx.request.body
    const wechatConfig = this.CONFIG.wechatServer

    const wxOpt = {
      appid: wechatConfig.mp.appId,
      secret: wechatConfig.mp.secret,
      js_code: code,
      grant_type: 'authorization_code',
    }
    const { errcode, session_key } = await ctx.state.axios.run('get', wechatConfig.api.jscode2session, wxOpt)
    if (errcode) throw new this.ce('eWechatAPI', 'wechatOAuthFailed')

    // https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserInfo.html
    const wxRes = ctx.state.wechat.wechatDataDecrypt(edata, session_key, iv)

    const wechatUserInfo = {
      open_id: wxRes.openId,
      union_id: wxRes.unionId,
      nickName: wxRes.nickName,
      avatar_url: wxRes.avatarUrl,
      ...wxRes,
    }

    // 缓存sessionKey
    const sessionCacheKey = this.t.genCacheKey('wechat', 'sessionKey', wechatConfig.mp.appId, wechatUserInfo.open_id)
    await ctx.state.redis.set(sessionCacheKey, session_key)

    ret.data = {
      identifier: wechatUserInfo.open_id,
      unique_id: wechatUserInfo.union_id,
      auth_info: wechatUserInfo,
    }

    if (isCallback) return ret.data
    ctx.state.sendJSON(ret)
  }

  async signInByOa(ctx, isCallback) {
    const ret = this.t.initRet()
    const { code } = ctx.request.body

    const webAccessTokenRes = await this._getAccessTokenRes(ctx, 'oa', code)
    const wechatUserInfo = await this._getWechatUserInfo(ctx, webAccessTokenRes)

    ret.data = {
      identifier: wechatUserInfo.open_id,
      unique_id: wechatUserInfo.union_id,
      auth_info: wechatUserInfo,
    }

    if (isCallback) return ret.data
    ctx.state.sendJSON(ret)
  }

  async signInByApp(ctx, isCallback) {
    const ret = this.t.initRet()
    const { code } = ctx.request.body

    const webAccessTokenRes = await this._getAccessTokenRes(ctx, 'app', code)
    const wechatUserInfo = await this._getWechatUserInfo(ctx, webAccessTokenRes)

    ret.data = {
      identifier: wechatUserInfo.open_id,
      unique_id: wechatUserInfo.union_id,
      auth_info: wechatUserInfo,
    }

    if (isCallback) return ret.data
    ctx.state.sendJSON(ret)
  }

  async checkSign(ctx, type = 'mp') {
    const query = ctx.request.body
    const wechatConfig = this.CONFIG.wechatServer

    const signStr = [wechatConfig[type].secret, query.timestamp, query.nonce].sort().join('')
    const sign = this.t.getSha1(signStr)

    if (sign !== query.signature) throw new this.ce('EWeixinAPI', 'checkSignFailed', query)

    ctx.body = query.echostr
  }

  async getJssdkSign(ctx) {
    const ret = this.t.initRet()
    const { url } = ctx.query
    const wechatConfig = this.CONFIG.wechatServer

    let accessToken
    const accessTokenCacheKey = this.t.genCacheKey('wechat', 'accessToken', wechatConfig.oa.appId)
    accessToken = await ctx.state.redis.get(accessTokenCacheKey)
    if (this.t.isEmpty(accessToken)) {
      const wxOpt = { appid: wechatConfig.oa.appId, secret: wechatConfig.oa.secret, grant_type: 'client_credential' }
      const wxRes = await ctx.state.axios.run('get', wechatConfig.api.getAccessToken, wxOpt)
      if (wxRes.errcode) throw new this.ce('eWechatAPI', wxRes.errmsg)
      // 缓存accessToken
      await ctx.state.redis.set(accessTokenCacheKey, wxRes.access_token, wxRes.expires_in)
      accessToken = wxRes.access_token
    }

    let ticket
    const ticketCacheKey = this.t.genCacheKey('wechat', 'ticket', wechatConfig.oa.appId)
    ticket = await ctx.state.redis.get(ticketCacheKey)
    if (this.t.isEmpty(ticket)) {
      const ticketOpt = { access_token: accessToken, type: 'jsapi' }
      const wxRes = await ctx.state.axios.run('get', wechatConfig.api.getJsTicket, ticketOpt)
      if (wxRes.errcode) throw new this.ce('eWechatAPI', wxRes.errmsg)
      // 缓存ticket
      await ctx.state.redis.set(ticketCacheKey, wxRes.ticket, wxRes.expires_in)
      ticket = wxRes.ticket
    }

    const timestamp = parseInt(Date.now() / 1000)
    const noncestr = this.t.genRandStr(8)
    let signStr = this.t.getSignStr({ url, noncestr: noncestr, timestamp, jsapi_ticket: ticket })

    ret.data = {
      appId: wechatConfig.oa.appId,
      timestamp,
      nonceStr: noncestr,
      signature: this.t.getSha1(signStr).toLowerCase(),
    }

    ctx.state.sendJSON(ret)
  }

  async queryOrder(ctx) {
    const ret = this.t.initRet()
    const orderNo = ctx.request.body.order_no
    ret.data = await ctx.state.wechat.queryOrder(orderNo)

    ctx.state.sendJSON(ret)
  }

  async refundOrder(ctx) {
    const ret = this.t.initRet()
    const orderNo = ctx.request.body.order_no
    const bizOrder = ctx.state.biz_order

    ret.data = await ctx.state.wechat.applyRefund(orderNo, bizOrder.price)

    ctx.state.sendJSON(ret)
  }

  async applyMicroMerchant(ctx) {
    const ret = this.t.initRet()

    const mchData = ctx.request.body

    ret.data = await ctx.state.wechat.applyMicroMerchant(mchData)
    ctx.state.sendJSON(ret)
  }
  async queryMicroMerchantApplyment(ctx) {
    const ret = this.t.initRet()

    const { applyment_id } = ctx.query

    ret.data = await ctx.state.wechat.queryMicroMerchantApplyment({ applyment_id })
    ctx.state.sendJSON(ret)
  }
  async uploadMedia(ctx) {
    const ret = this.t.initRet()

    const { file } = ctx.request.files

    ret.data = await ctx.state.wechat.uploadMedia(file)
    ctx.state.sendJSON(ret)
  }

  async bindPhone(ctx) {
    const { edata, iv } = ctx.request.body
    const wechatConfig = this.CONFIG.wechatServer

    const sessionCacheKey = this.t.genCacheKey(
      'wechat',
      'sessionKey',
      wechatConfig.mp.appId,
      ctx.state.user.wechat.open_id,
    )
    const sessionKey = await ctx.state.redis.get(sessionCacheKey)
    if (this.t.isEmpty(sessionKey)) throw new this.ce('sessionExpired', 'wechatSessionExpired')
    const wechatRes = ctx.state.wechat.wechatDataDecrypt(edata, sessionKey, iv)

    // 修改用户资料
    await Mod.userMod.run(ctx, 'bindPhone', ctx.state.userId, { phone: wechatRes.purePhoneNumber })

    ctx.state.sendJSON()
  }

  // 付款通知-微信总共会发起10次通知, 通知频率为15s/15s/30s/3m/10m/20m/30m/30m/30m/60m/3h/3h/3h/6h/6h - 总计 24h4m
  async wechatPayNotifyCallback(ctx) {
    // 微信支付通知xml数据解析
    const wxData = ctx.request.xmlJSON || {}

    const sign = ctx.state.wechat.getSign(wxData)
    if (sign !== wxData.sign) throw new this.ce('requestBad', 'invalidMessageData', wxData)

    // 通知消息校验, 避免重复通知
    const messageCheck = await Mod.messageMod.get(ctx, { code: wxData.out_trade_no, cause: 'wechat_pay' })
    if (!this.t.isEmpty(messageCheck)) {
      ctx.state.logger('debug', `微信支付再次通知: data=${JSON.stringify(wxData)}`)
      return ctx.state.sendXML({
        return_code: 'SUCCESS',
        return_msg: 'OK',
      })
    }

    // 查询订单信息
    const orderRes = await Mod.orderMod.get(ctx, { order_no: wxData.out_trade_no })
    if (this.t.isEmpty(orderRes)) throw new this.ce('noSuchOrder', { order_no: wxData.out_trade_no })

    const messageData = {
      id: this.t.genUUID(),
      title: '微信支付通知',
      cause: 'wechat_pay',
      code: wxData.out_trade_no,
      content: '支付成功',
      type: 'notice',
      notice_way: 'wechat.mp',
      extra_info: wxData,
    }
    await Mod.wechatMod.run(ctx, 'wechatPayNotifyCallback', orderRes, messageData)

    ctx.state.logger('debug', `微信支付通知: data=${JSON.stringify(wxData)}`)
    ctx.state.sendXML({
      return_code: 'SUCCESS',
      return_msg: 'OK',
    })
  }

  // 退款通知-微信总共会发起10次通知, 通知频率为15s/15s/30s/3m/10m/20m/30m/30m/30m/60m/3h/3h/3h/6h/6h - 总计 24h4m
  async wechatRefundNotifyCallback(ctx) {
    // 微信退款通知xml数据解析
    const { req_info } = ctx.request.xmlJSON || {}
    let wxData = await ctx.state.wechat.noticeCallbackDecrypt(Buffer.from(req_info, 'base64'))
    if (this.t.isEmpty(wxData)) throw new this.ce('requestBad', 'invalidMessageData', wxData)

    // 通知消息校验, 避免重复通知
    const messageCheck = await Mod.messageMod.get(ctx, { code: wxData.out_trade_no, cause: 'wechat_refund' })
    if (!this.t.isEmpty(messageCheck)) {
      return ctx.state.sendXML({
        return_code: 'SUCCESS',
        return_msg: 'OK',
      })
    }

    // 查询订单信息
    const orderRes = await Mod.orderMod.get(ctx, { order_no: wxData.out_trade_no })
    if (this.t.isEmpty(orderRes)) throw new this.ce('noSuchOrder', { order_no: wxData.out_trade_no })

    const messageData = {
      id: this.t.genUUID(),
      title: '微信退款通知',
      cause: 'wechat_refund',
      code: wxData.out_trade_no,
      content: this.CONST.sysWechatRefundStatus[wxData.refund_status.toLowerCase()],
      type: 'notice',
      notice_way: 'wechat.mp',
      extra_info: wxData,
    }
    Mod.wechatMod.run(ctx, 'wechatRefundNotifyCallback', orderRes, messageData)

    ctx.state.logger('debug', `微信退款通知: data=${JSON.stringify(wxData)}`)
    ctx.state.sendXML({
      return_code: 'SUCCESS',
      return_msg: 'OK',
    })
  }

  async send(ctx, ...args) {
    const opt = args.slice(-1)[0]

    if (opt.from === 'wechat.oa') return await this._sendOa(ctx, ...args)

    return await this._sendMp(ctx, ...args)
  }

  async _sendMp(ctx, targetId, templateId, data, options = {}) {
    let openId = targetId2
    if (targetId.length === 32) {
      const authCheck = await Mod.authMod.get(ctx, { user_id: targetId, from: 'wechat.mp' })
      if (this.t.isEmpty(authCheck)) return

      openId = authCheck.identifier
    }

    const accessTokenCacheKey = this.t.genCacheKey('wechat', 'accessToken')
    let access_token = await ctx.state.redis.get(accessTokenCacheKey)
    const wechatConfig = this.CONFIG.wechatServer

    if (this.t.isEmpty(access_token)) {
      const wxOpt = { appid: wechatConfig.mp.appId, secret: wechatConfig.mp.secret, grant_type: 'client_credential' }
      const wxRes = await ctx.state.axios.run('get', wechatConfig.api.getAccessToken, wxOpt)
      if (wxRes.errcode) throw new this.ce('eWechatAPI', wxRes.errmsg)
      // 缓存accessToken
      await ctx.state.redis.set(accessTokenCacheKey, wxRes.access_token, wxRes.expires_in)
      access_token = wxRes.access_token
    }

    const msgOpt = this.t.jsonFormat({
      touser: openId,
      template_id: templateId,
      page: options.page,
      miniprogram_state: options.miniprogram_state || 'developer',
      data,
    })

    const url = wechatConfig.api.sendSubscribeMessage + `?access_token=${access_token}`
    const wechatRes = await ctx.state.axios.run('post', url, msgOpt)

    if (wechatRes.errcode) ctx.state.logger(wechatRes.errcode, '发送消息发生异常: ', wechatRes.errmsg)
    return wechatRes
  }

  /**
   *
   * @param {object} ctx ctx上下文
   * @param {string} from 来着哪个应用(oa|app)
   * @param {string} [code] 授权code
   */
  async _getAccessTokenRes(ctx, from, code) {
    const wechatConfig = this.CONFIG.wechatServer

    const wxOpt = {
      appid: wechatConfig[from].appId,
      secret: wechatConfig[from].secret,
      code,
      grant_type: 'authorization_code',
    }
    const wxRes = await ctx.state.axios.run('get', wechatConfig.api.code2AccessToken, wxOpt)
    if (wxRes.errcode) throw new this.ce('eWechatAPI', wxRes.errmsg)

    // 缓存webAccessTokenRes
    const webAccessTokenCacheKey = this.t.genCacheKey(
      'wechat',
      'webAccessToken',
      wechatConfig[from].appId,
      wxRes.unionid || wxRes.openid,
    )
    await ctx.state.redis.set(webAccessTokenCacheKey, this.t.jsonStringify(wxRes), wxRes.expires_in)

    // 缓存webRefreshToken
    const webRefreshTokenCacheKey = this.t.genCacheKey(
      'wechat',
      'webRefreshToken',
      wechatConfig[from].appId,
      wxRes.unionid || wxRes.openid,
    )
    await ctx.state.redis.set(webRefreshTokenCacheKey, wxRes.refresh_token, 30 * 24 * 60 * 60)

    return wxRes
  }

  async _getWechatUserInfo(ctx, webAccessTokenRes) {
    // https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#3
    const wxRes = await ctx.state.axios.run('get', this.CONFIG.wechatServer.api.getUserInfo, {
      access_token: webAccessTokenRes.access_token,
      openid: webAccessTokenRes.openid,
      lang: 'zh_CN',
    })
    if (wxRes.errcode) throw new this.ce('eWechatAPI', wxRes.errmsg)

    return {
      open_id: wxRes.openid,
      union_id: wxRes.unionid,
      avatar_url: wxRes.headimgurl,
      ...wxRes,
    }
  }
})()

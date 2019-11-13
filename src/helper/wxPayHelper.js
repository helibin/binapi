/*
 * @Author: helibin@139.com
 * @Date: 2018-12-05 16:29:32
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-22 16:12:46
 */
/** 内建模块 */

/** 第三方模块 */
import dayjs from 'dayjs'

/** 基础模块 */
import CONFIG from 'config'
import T from './toolkit'
import ce from './customError'

/** 项目模块 */

/** 预处理 */
const wxConfig = CONFIG.wxServer

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
  }

  getSign(data, excludeFields) {
    const signStr = this.t.getSignStr(data, excludeFields)
    const sign = this.t.getMd5(`${signStr}&key=${wxConfig.payment.key}`)

    return sign.toUpperCase()
  }

  genTradeNo() {
    return process.env.NODE_ENV === 'prod'
      ? `W${dayjs().valueOf()}${this.t.genNonceStr(2, true)}`
      : `${process.env.NODE_ENV}-W${dayjs().valueOf()}${this.t.genNonceStr(2, true)}`
  }

  async wxRequest(api, param) {
    const xmlData = await this.t.buildXML(param)
    const xmlRes = await this.ctx.state.axios
      .run('post', api, xmlData, {
        headers: { 'content-type': 'text/xml' },
        responseType: 'text/xml',
      })
      .catch(async ex => {
        this.ctx.state.logger(ex, 'wxPay发生异常：', ex)
        ex = await this.t.parseXML(ex)
        throw new ce('eWeixinAPI', ex, param)
      })

    const res = await this.t.parseXML(xmlRes)
    this.ctx.state.logger('debug', 'wxPay返回值：', res)
    if ([res.return_code, res.result_code].includes('FAIL')) {
      throw new ce(
        'eWeixinAPI',
        res.err_code_des || res.return_msg || res.retmsg,
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : param,
      )
    }

    return res
  }

  async genOrder(type = 'app', fee = 0, options) {
    options = options || {}

    const timeStart = dayjs()
    let param = {
      mch_id: options.mch_id || wxConfig.payment.mchId, // JSAPI|NATIVE|APP|MWEB
      device_info: options.device_info || 'WEB',
      nonce_str: options.nonce_str || this.t.genNonceStr(16), // JSAPI|NATIVE|APP|MWEB
      sign_type: options.sign_type || 'MD5',
      body: options.body || '母婴助手 - 订单支付', // JSAPI|NATIVE|APP|MWEB
      detail: options.detail,
      attach: options.attach,
      out_trade_no: options.out_trade_no || this.genTradeNo(), // JSAPI|NATIVE|APP|MWEB
      fee_type: options.fee_type || 'CNY',
      total_fee: this.t.compute(fee * 100, 2), // JSAPI|NATIVE|APP|MWEB
      spbill_create_ip: options.ip || this.ctx.state.clientIp, // JSAPI|NATIVE|APP|MWEB
      time_start: timeStart.format('YYYYMMDDHHmmss'),
      time_expire: timeStart.add(2, 'hour').format('YYYYMMDDHHmmss'),
      goods_tag: options.goods_tag,
      notify_url: options.notify_url || wxConfig.payment.api.notifyUrl, // JSAPI|NATIVE|APP|MWEB
      trade_type: type.toUpperCase(), // JSAPI|NATIVE|APP|MWEB
      limit_pay: options.limit_pay,
      receipt: options.receipt || 'Y',
      openid: options.open_id, // JSAPI
    }

    switch (type) {
      case 'app': // app支付
        param = {
          ...param,
          appid: wxConfig.app.appId,
        }
        break
      case 'mweb': // H5支付
        param = {
          ...param,
          appid: wxConfig.mp.appId,
          scene_info: JSON.stringify({
            h5_info: {
              type: options.scene_type || 'Wap',
              app_name: options.app_name,
              bundle_id: options.bundle_id,
              package_name: options.package_name,
              wap_url: options.h5_url,
              wap_name: options.h5_name || '母婴助手H5',
            },
          }),
        }
        break
      case 'jsapi': // 公众号、小程序支付
        param = {
          ...param,
          appid: wxConfig[options.pay_from || 'mp'].appId,
          openid: options.open_id,
        }
        break
      case 'native': // 扫码支付
        param = {
          ...param,
          appid: wxConfig.mp.appId,
          product_id: options.product_id,
        }
        break
    }

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信统一下单接口, 参数：', JSON.stringify(param))
    return await this.wxRequest(wxConfig.payment.api.createOrder, param)
  }

  async genPayParam(type = 'app', options = {}) {
    let param = {}

    switch (type) {
      case 'app': // app支付
        param = {
          appid: options.appId || wxConfig.mp.appId,
          partnerid: options.partnerid || wxConfig.payment.mchId,
          prepayid: options.prepay_id,
          package: options.package || 'Sign=WXPay',
          noncestr: this.t.genNonceStr(16),
          timestamp: String(dayjs().unix()),
        }
        param.sign = this.getSign(param)
        break
      case 'jsapi': // 公众号、小程序支付
        param = {
          appId: options.appId || wxConfig[options.pay_from || 'mp'].appId,
          timeStamp: String(dayjs().unix()),
          nonceStr: String(this.t.genNonceStr(16)),
          package: 'prepay_id=' + options.prepay_id,
          signType: options.signType || 'MD5',
        }
        param.paySign = this.getSign(this.t.jsonFormat(param))
        break
      case 'mweb':
        param = {
          mweb_url: options.mweb_url,
        }
        break
    }

    return param
  }

  async queryOrder(orderId, options = { type: 'app' }) {
    const param = {
      appid: options.appId || wxConfig[options.type].appId,
      mch_id: wxConfig.payment.mchId,
      out_trade_no: orderId,
      nonce_str: String(this.t.genRandStr(16)),
    }
    param.sign = this.getSign(param)

    this.ctx.state.logger('info', '调用微信查询订单接口, 参数：', JSON.stringify(param))
    return await this.wxRequest(wxConfig.payment.api.queryOrder, param)
  }

  async closeOrder(orderId, options = { type: 'app' }) {
    const param = {
      appid: options.appId || wxConfig[options.type].appId,
      mch_id: wxConfig.payment.mchId,
      out_trade_no: orderId,
      nonce_str: String(this.t.genRandStr(16)),
    }
    param.sign = this.getSign(param)

    this.ctx.state.logger('info', '调用微信关闭订单接口, 参数：', JSON.stringify(param))
    return await this.wxRequest(wxConfig.payment.api.closeOrder, param)
  }

  async applyRefund(orderNo, amount, options = { type: 'app' }) {
    const param = {
      appid: options.appId || wxConfig[options.type].appId,
      mch_id: wxConfig.payment.mchId,
      nonce_str: options.nonce_str || this.t.genNonceStr(16),

      sign_type: options.sign_type || 'MD5',
      out_trade_no: orderNo,
      out_refund_no: orderNo,
      total_fee: this.t.compute(amount * 100, 2),
      refund_fee: this.t.compute(amount * 100, 2),
      refund_fee_type: options.refund_fee_type || 'CNY',
      refund_desc: options.refund_desc,
      refund_account: options.refund_account,
      notify_url: options.notify_url,
    }
    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信申请退款接口, 参数：', JSON.stringify(param))
    return await this.wxRequest(wxConfig.payment.api.applyRefund, param)
  }
}

// https://pay.weixin.qq.com/wiki/doc/api/index.html

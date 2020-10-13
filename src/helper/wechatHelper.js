/*
 * @Author: helibin@139.com
 * @Date: 2018-12-05 16:29:32
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:14:16
 */
/** 内建模块 */
import fs from 'fs'
import https from 'https'
import path from 'path'

/** 第三方模块 */
import dayjs from 'dayjs'
import crypto from 'crypto'
import FormData from 'form-data'

/** 基础模块 */
import CONFIG from 'config'
import T from './toolkit'
import ce from './customError'
import Log from './logger'

/** 项目模块 */

/** 预处理 */
const wechatConfig = CONFIG.wechatServer

// 双向证书
let httpsAgent
try {
  const certFilePath = path.join(__dirname, '../../', wechatConfig.payment.certPath)
  if (fs.existsSync(certFilePath)) {
    httpsAgent = new https.Agent({
      pfx: fs.readFileSync(certFilePath),
      passphrase: wechatConfig.payment.mchId,
    })
  }
} catch (ex) {
  Log.logger(ex, '初始化微信双向证书失败: ', JSON.stringify(ex))
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
  }

  getSign(data, exclude, type = 'sha256') {
    let signStr = this.t.getSignStr(data, exclude)
    signStr = `${signStr}&key=${wechatConfig.payment.key}`
    if (type && type.toUpperCase() === 'MD5') return this.t.getMd5(signStr)

    return this.t.getHMac(type.toLowerCase(), signStr, wechatConfig.payment.key)
  }

  genTradeNo() {
    return process.env.NODE_ENV === 'prod'
      ? `W${dayjs().valueOf()}${this.t.genRandNum(2)}`
      : `${process.env.NODE_ENV}-W${dayjs().valueOf()}${this.t.genRandNum(2)}`
  }

  async wxRequest(api, param, extraOpt = {}) {
    try {
      param = extraOpt.toXml ? param : await this.t.json2xml(this.t.jsonFormat(param))

      const xmlRes = await this.ctx.state.axios.run('post', api, param, {
        headers: { 'content-type': 'text/xml', ...extraOpt.headers },
        responseType: 'text/xml',
        httpsAgent: extraOpt.ssl && httpsAgent,
        ...extraOpt,
      })

      const res = await this.t.xml2json(xmlRes)
      this.ctx.state.logger('debug', 'wechat返回值: ', res)
      if ([res.return_code, res.result_code].includes('FAIL')) {
        throw new ce(
          'eWechatAPI',
          res.err_code_des || res.return_msg || res.retmsg,
          ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : res,
        )
      }

      return res
    } catch (ex) {
      this.ctx.state.logger(ex, 'wechat发生异常: ', ex)
      if (ex instanceof ce) throw ex

      const exJson = await this.t.xml2json(ex)
      throw new ce('eWechatAPI', exJson)
    }
  }

  async genOrder(payFrom = 'mp', fee = 0, options) {
    options = options || {}

    const now = dayjs()
    let param = {
      mch_id: options.mch_id || wechatConfig.payment.mchId, // JSAPI|NATIVE|APP|MWEB
      sub_mch_id: options.sub_mch_id || wechatConfig.payment.subMchId || undefined,
      device_info: options.device_info || 'WEB',
      nonce_str: options.nonce_str || this.t.genRandStr(16), // JSAPI|NATIVE|APP|MWEB
      sign_type: options.sign_type || 'HMAC-SHA256',
      body: options.body || `${CONFIG.site.name || '收银台'}-订单支付`, // JSAPI|NATIVE|APP|MWEB
      detail: options.detail,
      attach: options.attach,
      out_trade_no: options.out_trade_no || this.genTradeNo(), // JSAPI|NATIVE|APP|MWEB
      fee_type: options.fee_type || 'CNY',
      total_fee: this.t.compute(fee * 100, 2), // JSAPI|NATIVE|APP|MWEB
      spbill_create_ip: options.ip || this.ctx.state.clientIp, // JSAPI|NATIVE|APP|MWEB
      time_start: now.format('YYYYMMDDHHmmss'),
      time_expire: now.add(2, 'hour').format('YYYYMMDDHHmmss'),
      goods_tag: options.goods_tag,
      notify_url: options.notify_url || wechatConfig.payment.api.payNotifyUrl, // JSAPI|NATIVE|APP|MWEB
      trade_type: (['mp', 'oa'].includes(payFrom) ? 'jsapi' : payFrom).toUpperCase(), // JSAPI|NATIVE|APP|MWEB
      limit_pay: options.limit_pay,
      receipt: options.receipt || 'Y',
    }

    switch (payFrom) {
      case 'app': // app支付
        // appid和sub_appid二选一
        param = {
          ...param,
          appid: options.app_id || wechatConfig.app.appId,
          sub_appid: options.subAppId,
        }
        break
      case 'mweb': // H5支付
        param = {
          ...param,
          appid: options.app_id || wechatConfig.oa.appId,
          scene_info: JSON.stringify({
            h5_info: {
              type: options.scene_type || 'Wap',
              app_name: options.app_name,
              bundle_id: options.bundle_id,
              package_name: options.package_name,
              wap_url: options.h5_url,
              wap_name: options.h5_name || 'OPO充电桩H5',
            },
          }),
        }
        break
      case 'mp': // 小程序支付, 默认小程序
      case 'oa': // 公众号支付
        let jsapiParam
        if (wechatConfig.payment.isMain) {
          jsapiParam = {
            appid: options.app_id || wechatConfig.payment.appId,
            sub_appid: options.app_id || wechatConfig[payFrom].appId,
            sub_openid: options.open_id,
          }
        } else {
          jsapiParam = {
            appid: options.app_id || wechatConfig[payFrom].appId,
            openid: options.open_id,
          }
        }
        param = { ...param, ...jsapiParam }
        break
      case 'native': // 扫码支付
        param = {
          ...param,
          appid: options.app_id || wechatConfig.oa.appId,
          product_id: options.product_id,
        }
        break
    }

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信统一下单接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.createOrder, param)
  }

  async genPayParam(payFrom = 'mp', wechatOrder = {}) {
    let param = {}

    switch (payFrom) {
      case 'app': // app支付
        param = {
          appid: wechatOrder.appId || wechatConfig.mp.appId,
          partnerid: wechatOrder.partnerid || wechatConfig.payment.mchId,
          prepayid: wechatOrder.prepay_id,
          package: wechatOrder.package || 'Sign=WXPay',
          noncestr: this.t.genRandStr(16),
          timestamp: String(dayjs().unix()),
        }
        param.sign = this.getSign(this.t.jsonFormat(param))
        break
      case 'mp': // 小程序支付
      case 'oa': // 公众号支付
        param = {
          appId: wechatOrder.appId || wechatConfig[payFrom].appId,
          timeStamp: String(dayjs().unix()),
          nonceStr: String(this.t.genRandStr(16)),
          package: 'prepay_id=' + wechatOrder.prepay_id,
          signType: wechatOrder.signType || 'HMAC-SHA256',
        }
        param.paySign = this.getSign(this.t.jsonFormat(param))
        break
      case 'mweb':
        param = {
          mweb_url: wechatOrder.mweb_url,
        }
        break
    }

    return param
  }

  async queryOrder(orderId, options = { payFrom: 'mp' }) {
    const param = {
      appid: options.app_id || wechatConfig[wechatConfig.payment.isMain ? 'payment' : options.payFrom].appId,
      mch_id: wechatConfig.payment.mchId,
      sub_mch_id: options.sub_mch_id || wechatConfig.payment.subMchId || undefined,
      sub_appid: options.subAppId,
      out_trade_no: orderId,
      nonce_str: String(this.t.genRandStr(16)),
      sign_type: options.sign_type || 'HMAC-SHA256',
    }
    if (wechatConfig.payment.isMain) {
      param.sub_appid = options.app_id || wechatConfig[options.payFrom].appId
    }

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信查询订单接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.queryOrder, param)
  }

  async closeOrder(orderNo, options = { payFrom: 'mp' }) {
    const param = {
      appid: options.appId || wechatConfig[options.payFrom].appId,
      mch_id: wechatConfig.payment.mchId,
      sub_mch_id: options.sub_mch_id || wechatConfig.payment.subMchId || undefined,
      out_trade_no: orderNo,
      nonce_str: String(this.t.genRandStr(16)),
      sign_type: options.sign_type || 'HMAC-SHA256',
    }
    if (wechatConfig.payment.isMain) {
      param.sub_appid = options.app_id || wechatConfig[options.payFrom].appId
    }

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信关闭订单接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.closeOrder, param)
  }

  /**
   * 当交易发生之后一段时间内, 由于买家或者卖家的原因需要退款时, 卖家可以通过退款接口将支付款退还给买家, 微信支付将在收到退款请求并且验证成功之后, 按照退款规则将支付款按原路退到买家帐号上。
   * 注意:
   * 1、交易时间超过一年的订单无法提交退款
   * 2、微信支付退款支持单笔交易分多次退款, 多次退款需要提交原支付订单的商户订单号和设置不同的退款单号。申请退款总金额不能超过订单金额。 一笔退款失败后重新提交, 请不要更换退款单号, 请使用原商户退款单号
   * 3、请求频率限制: 150qps, 即每秒钟正常的申请退款请求次数不超过150次
   *    错误或无效请求频率限制: 6qps, 即每秒钟异常或错误的退款申请请求不超过6次
   * 4、每个支付订单的部分退款次数不能超过50次
   *
   * 请求需要双向证书
   * @param {*} orderNo 订单号
   * @param {*} amount 退款金额
   * @param {*} options 参数
   */
  async applyRefund(orderNo, amount, options = { payFrom: 'mp' }) {
    const param = {
      appid: options.appId || wechatConfig[options.payFrom].appId || wechatConfig.payment.appId,
      mch_id: wechatConfig.payment.mchId,
      sub_mch_id: options.sub_mch_id || wechatConfig.payment.subMchId || undefined,
      nonce_str: options.nonce_str || this.t.genRandStr(16),
      sign_type: options.sign_type || 'HMAC-SHA256',
      out_trade_no: orderNo,
      out_refund_no: orderNo,
      total_fee: this.t.compute(amount * 100, 2),
      refund_fee: this.t.compute(amount * 100, 2),
      refund_fee_type: options.refund_fee_type || 'CNY',
      refund_desc: options.refund_desc,
      refund_account: options.refund_account,
      notify_url: options.notify_url || wechatConfig.payment.api.refundNotifyUrl,
    }
    if (wechatConfig.payment.isMain) {
      param.sub_appid = options.app_id || wechatConfig[options.payFrom].appId
    }

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信申请退款接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.applyRefund, param, { ssl: true })
  }

  // 字段对照表 https://pay.weixin.qq.com/wiki/doc/api/xiaowei.php?chapter=22_1
  async applyMicroMerchant(data) {
    const param = {
      version: '3.0',
      mch_id: wechatConfig.payment.mchId,
      nonce_str: data.nonce_str || this.t.genRandStr(16),
      sign_type: 'HMAC-SHA256',
      business_code: data.order_no || this.genTradeNo(),

      id_card_copy: data.id_card_copy, // 身份证人像面照片. 请填写由图片上传接口预先上传图片生成好的media_id
      id_card_national: data.id_card_national, // 身份证国徽面照片. 请填写由图片上传接口预先上传图片生成好的media_id
      id_card_name: data.id_card_name, // 身份证姓名. 请填写小微商户本人身份证上的姓名, 该字段需进行加密处理
      id_card_number: data.id_card_number, // 身份证号码. 15位数字或17位数字+1位数字|X, 该字段需进行加密处理
      id_card_valid_time: data.id_card_valid_time, // 身份证有效期限. 与上传的身份证照片内容一致, 例: ["1970-01-01","长期"]
      account_bank: data.account_bank, // 开户银行. 详细参见开户银行对照表
      account_name: data.account_name, // 开户名称. 必须与身份证姓名一致, 该字段需进行加密处理
      account_number: data.account_number, // 银行账号. 数字, 长度遵循系统支持的对私卡号长度要求,该字段需进行加密处理
      bank_address_code: data.bank_address_code, // 开户银行省市编码. 至少精确到市, 详细参见对照表, 例: 110000
      store_name: data.store_name, // 门店名称
      store_address_code: data.store_address_code, // 门店省市编码
      store_address: data.store_address, // 门店街道名称
      store_entrance_pic: data.store_entrance_pic, // 门店门口照片. 请填写由图片上传接口预先上传图片生成好的media_id
      indoor_pic: data.indoor_pic, // 店内环境照片. 请填写由图片上传接口预先上传图片生成好的media_id
      merchant_shortname: data.merchant_shortname, // 商户简称
      service_phone: data.service_phone, // 客服电话
      product_desc: data.product_desc, // 售卖商品|提供服务描述. 请填写以下描述之一：餐饮|线下零售|居民生活服务|休闲娱乐|交通出行|其他
      rate: data.rate, // 费率. 枚举值0.38%、0.39%、0.4%、0.45%、0.48%、0.49%、0.5%、0.55%、0.58%、0.59%、0.6%
      contact: data.contact, // 超级管理员姓名, 该字段需进行加密处理
      contact_phone: data.contact_phone, // 手机号码, 该字段需进行加密处理
      contact_email: data.contact_email, // 联系邮箱, 该字段需进行加密处理

      // 可选
      store_street: data.store_street || '无', // 门店街道名称
      bank_name: data.bank_name, // 开户银行全称（含支行）
      store_longitude: data.store_longitude, // 门店经度
      store_latitude: data.store_latitude, // 门店纬度
      address_certification: data.address_certification, // 经营场地证明. 请填写由图片上传接口预先上传图片生成好的media_id
      business_addition_desc: data.business_addition_desc, // 补充说明
      business_addition_pics: data.business_addition_pics, // 补充材料, 最多可上传5张照片. 请填写由图片上传接口预先上传图片生成好的media_id
    }

    const { cert_sn, cert_str } = await this.getCert()
    param.cert_sn = cert_sn

    // 数据加密签名
    param.id_card_name = this.fieldEncrypt(data.id_card_name, cert_str)
    param.id_card_number = this.fieldEncrypt(data.id_card_number, cert_str)
    param.account_name = this.fieldEncrypt(data.account_name, cert_str)
    param.account_number = this.fieldEncrypt(data.account_number, cert_str)
    param.contact = this.fieldEncrypt(data.contact, cert_str)
    param.contact_phone = this.fieldEncrypt(data.contact_phone, cert_str)
    param.contact_email = this.fieldEncrypt(data.contact_email, cert_str)

    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信小微商户申请接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.applyMicroMechant, param, { ssl: true })
  }

  async queryMicroMerchantApplyment(data) {
    const param = {
      version: '1.0',
      mch_id: wechatConfig.payment.mchId,
      nonce_str: this.t.genRandStr(16),
      sign_type: 'HMAC-SHA256',
      applyment_id: data.applyment_id,
      business_code: data.order_no,
    }
    param.sign = this.getSign(this.t.jsonFormat(param))

    this.ctx.state.logger('info', '调用微信小微商户查询申请状态接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.queryMicroMerchantApplyment, param, { ssl: true })
  }

  /**
   * 上传图片, 支持 jpeg、jpg、bmp、png格式
   *
   * @param {File} file 文件对象
   */
  async uploadMedia(file) {
    const fileBuffer = fs.readFileSync(file.path)
    let formData = new FormData()
    const param = {
      mch_id: wechatConfig.payment.mchId,
      media_hash: this.t.getMd5(fileBuffer),
      sign_type: 'HMAC-SHA256',
    }

    param.sign = this.getSign(param, ['media'])
    for (const d in param) {
      formData.append(d, param[d])
    }

    formData.append('media', fileBuffer, {
      filename: `${this.t.genUUID()}.${file.name.split('.').slice(-1)[0]}`,
      filelength: file.size,
      'Content-Type': file.type,
    })

    this.ctx.state.logger('info', '调用微信小微商户文件上传接口, 参数: ', JSON.stringify(param))
    return await this.wxRequest(wechatConfig.payment.api.uploadMedia, formData.getBuffer(), {
      ssl: true,
      toXml: true,
      timeout: 1000 * 1000,
      headers: formData.getHeaders(),
    })
  }

  async getCert() {
    let param = {}
    try {
      param = {
        mch_id: wechatConfig.payment.mchId,
        nonce_str: this.t.genRandStr(16),
        sign_type: 'HMAC-SHA256',
      }

      param = this.t.jsonFormat(param)
      param.sign = this.getSign(param)

      const { certificates } = await this.wxRequest(wechatConfig.payment.api.getCert, param, { ssl: true })

      // 解密证书
      const { data } = JSON.parse(certificates)
      const { serial_no, effective_time, expire_time, encrypt_certificate } = data[0]
      const { ciphertext, nonce, associated_data } = encrypt_certificate

      const certStr = await this.certDecrypt(ciphertext, nonce, associated_data)
      const certRes = { cert_sn: serial_no, cert_start: effective_time, cert_end: expire_time, cert_str: certStr }

      this.ctx.state.logger('debug', '获取证书成功', certRes)
      return certRes
    } catch (ex) {
      this.ctx.state.logger(ex, '获取证书失败', ex)
      throw new ce('eWechatAPI', 'getCertFaild', param)
    }
  }

  /**
   *
   * @param {*} data base64数据
   * @param {string} rawText 待加密内容
   * @param {string(32)} key 密匙
   * @param {string(16)} iv 向量
   * @param {*} options
   * @param {*} [options.method=aes-128-cbc] 加密算法(aes-128-cbc|aes-256-cbc)
   */
  wechatDataDecrypt(edata, key, iv, options = { method: 'aes-128-cbc' }) {
    try {
      // base64 decode
      const _key = Buffer.from(key, 'base64')
      const _edata = Buffer.from(edata, 'base64')
      const _iv = Buffer.from(iv, 'base64')

      let clearEncoding = 'utf8'
      let cipherEncoding = 'base64'
      let cipherChunks = []
      let decipher = crypto.createDecipheriv(options.method, _key, _iv)
      decipher.setAutoPadding(true) // 设置自动 padding 为 true, 删除填充补位

      cipherChunks.push(decipher.update(_edata, cipherEncoding, clearEncoding))
      cipherChunks.push(decipher.final(clearEncoding))

      const cipherObj = JSON.parse(cipherChunks.join(''))
      this.ctx.state.logger('debug', 'wechatDataDecrypt解密成功: ', cipherObj)

      // 校验appId是否匹配
      if (cipherObj.watermark.appid !== wechatConfig.mp.appId) {
        throw new ce('appIdNotMatch', { app_id: cipherObj.watermark.appid })
      }

      return cipherObj
    } catch (ex) {
      this.ctx.state.logger(ex, 'wechatDataDecrypt解密失败: ', ex)
      if (ex instanceof ce) throw ex

      throw new ce(
        'eWechatAPI',
        'wechatDataDecryptFailed',
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : { edata, key, iv },
      )
    }
  }

  /**
   * aes解密微信回调通知
   * @param {buffer} base64Buffer 待解密内容
   * @param key 必须为32位私钥
   * @returns {string}
   */
  async noticeCallbackDecrypt(
    base64Buffer,
    key = this.t.getMd5(CONFIG.wechatServer.payment.key),
    iv = Buffer.alloc(0),
  ) {
    try {
      if (!base64Buffer) return ''

      let clearEncoding = 'utf8'
      let cipherEncoding = 'base64'
      let cipherChunks = []
      let decipher = crypto.createDecipheriv('aes-256-ecb', key.toLowerCase(), iv)
      decipher.setAutoPadding(true)
      cipherChunks.push(decipher.update(base64Buffer, cipherEncoding, clearEncoding))
      cipherChunks.push(decipher.final(clearEncoding))

      const retData = await this.t.xml2json(cipherChunks.join('').replace(/root>/g, 'xml>'))

      this.ctx.state.logger('debug', 'wechatDataDecrypt解密成功: ', retData)
      return retData
    } catch (ex) {
      this.ctx.state.logger(ex, 'noticeCallbackDecrypt解密失败: ', ex)
      if (ex instanceof ce) throw ex

      throw new ce(
        'eWechatAPI',
        'noticeCallbackDecryptFailed',
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : { base64Buffer, key, iv },
      )
    }
  }

  /**
   *
   * @param {string} rawText 待加密内容
   * @param {string(32)} publicKey 公钥
   */
  fieldEncrypt(rawText, publicKey) {
    try {
      const opt = {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      }
      return crypto.publicEncrypt(opt, Buffer.from(rawText)).toString('base64')
    } catch (ex) {
      this.ctx.state.logger(ex, 'fieldEncrypt加密失败: ', ex)
      if (ex instanceof ce) throw ex

      throw new ce(
        'eWechatAPI',
        'fieldEncryptFaild',
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : { rawText, publicKey },
      )
    }
  }
  /**
   *
   * @param {string} base64Str 待解密密内容
   * @param {string(32)} privateKey 密钥
   *
   */
  fieldDecrypt(base64Str, privateKey = fs.readFileSync(path.join(__dirname, '../../', wechatConfig.payment.keyPath))) {
    try {
      const opt = {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      }
      return crypto.privateDecrypt(opt, Buffer.from(base64Str, 'base64')).toString()
    } catch (ex) {
      this.ctx.state.logger(ex, 'fieldDecrypt解密失败: ', ex)
      if (ex instanceof ce) throw ex

      throw new ce(
        'eWechatAPI',
        'fieldDecryptFaild',
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : { base64Str, privateKey },
      )
    }
  }

  async certDecrypt(cipherText, nonce, associated_data, key = wechatConfig.payment.keyV3) {
    try {
      cipherText = Buffer.from(cipherText, 'base64')
      let decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce)

      let authTag = cipherText.slice(cipherText.length - 16)
      decipher.setAuthTag(authTag)

      let data = cipherText.slice(0, cipherText.length - 16)
      decipher.setAAD(Buffer.from(associated_data))

      return [decipher.update(data, 'binary', 'utf8'), decipher.final('utf8')].join('')
    } catch (ex) {
      this.ctx.state.logger(ex, 'certDecrypt解密失败: ', ex)
      if (ex instanceof ce) throw ex

      throw new ce(
        'eWechatAPI',
        'certDecryptFaild',
        ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : { base64Str, privateKey },
      )
    }
  }
}
// https://pay.weixin.qq.com/wiki/doc/api/index.html

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-31 16:32:39
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 09:18:13
 */
/** 内建模块 */

/** 第三方模块 */
import SMS from '@alicloud/sms-sdk'
import chalk from 'chalk'
import dayjs from 'dayjs'

/** 基础模块 */
import CONFIG from 'config'
import ce from './customError'
import T from './toolkit'

/** 项目模块 */
import Log from './logger'

/** 预处理 */
const smsConf = CONFIG.alyServer.sms
const alyAK = smsConf.accessKeyId
const alyAS = smsConf.accessKeySecret
let smsClient = {}

if (alyAK && alyAS) {
  smsClient = new SMS({ accessKeyId: alyAK, secretAccessKey: alyAS })
} else {
  Log.logger('error', 'alySms服务缺少参数  ：', `alyAK='${alyAK}', alyAS='${alyAS}'`)
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
    this.smsClient = smsClient
  }

  /**
   * 创建短信验证码缓存键值
   *
   * @param {string} type 短信验证码类型(aliSMS)
   * @param {string} cate 短信验证码分类
   * @param {string} clientId 客户端ID
   * @param {string} phone 手机号码
   * @returns {string} 短信验证码缓存键值
   */
  createCacheKey(type, cate, clientId, phone) {
    return `smsCode@${cate}#user=${CONFIG.webServer.name}:type=${type}:clientId=${clientId}:phone=${phone}`
  }

  /**
   * 发送验证码
   *
   * @param {string} phone 大陆手机号码
   * @param {string} [cate='default'] 短信验证码分类（signUp|resetPassword...）
   * @param {int} [len=4] 验证码长度
   * @returns {number} code
   */
  async sendSMS(phone, cate = 'default', len = 4) {
    const code = this.t.genRandStr(len, '1234567890')

    const cacheKey = this.createCacheKey('alySms', cate, this.t.getMd5(this.ctx.userAgent.source), phone)
    const retryCacheKey = this.t.genCacheKey('alySms@retryTimeout', cate, phone)

    // 限流, 5/h, 10/day
    const limitHourCacheKey = this.t.genCacheKey('alySms@limitHour', cate, phone)
    const limitDayCacheKey = this.t.genCacheKey('alySms@limitDay', cate, phone)

    const smsOpt = {
      PhoneNumbers: phone,
      TemplateParam: JSON.stringify({ code }),
      SignName: smsConf.signName,
      TemplateCode: smsConf.template[cate] || smsConf.template.default,
    }

    try {
      // 查询重试标记
      const retryCacheCheck = await this.ctx.state.redis.get(retryCacheKey)
      if (!this.t.isEmpty(retryCacheCheck)) {
        throw new ce('eAliyunAPI', 'EClientTooManyRequest')
      }

      // 查询限流
      const limitDayCacheCheck = await this.ctx.state.redis.get(limitDayCacheKey)
      let limitDayCacheCheckObj = this.t.jsonParse(limitDayCacheCheck) || {}
      if (!this.t.isEmpty(limitDayCacheCheck)) {
        if (Math.abs(dayjs().diff(limitDayCacheCheckObj.initTime, 'day'))) {
          await this.ctx.state.redis.del(limitDayCacheCheck)
          limitDayCacheCheckObj = {}
        } else if (limitDayCacheCheckObj.count + 1 > CONFIG.webServer.smsCodLimit.day) {
          throw new ce('eAliyunAPI', 'EClientLimitRequestPerDay')
        }
      }
      const limitHourCacheCheck = await this.ctx.state.redis.get(limitHourCacheKey)
      let limitHourCacheCheckObj = this.t.jsonParse(limitHourCacheCheck) || {}
      if (!this.t.isEmpty(limitHourCacheCheck)) {
        if (Math.abs(dayjs().diff(limitHourCacheCheckObj.initTime, 'hour'))) {
          await this.ctx.state.redis.del(limitHourCacheCheck)
          limitHourCacheCheckObj = {}
        } else if (limitHourCacheCheckObj.count + 1 > CONFIG.webServer.smsCodLimit.hour) {
          throw new ce('eAliyunAPI', 'EClientLimitRequestPerHour')
        }
      }

      const smsRes = await this.smsClient.sendSMS(smsOpt)
      if (smsRes.Code !== 'OK') {
        if (smsRes.code === 'isv.BUSINESS_LIMIT_CONTROL') {
          throw new ce('eAliyunAPI', 'EClientTooManyRequest')
        }

        this.ctx.state.logger('error', '获取阿里云短信异常：', JSON.stringify(smsRes))
        throw new ce('eAliyunAPI', 'senSMSFailed', smsRes)
      }

      // 设置验证码缓存
      await this.ctx.state.redis.set(cacheKey, code, CONFIG.webServer.smsCodeMaxAge)
      // 设置重试标记
      await this.ctx.state.redis.set(retryCacheKey, `${Date.now()}`, CONFIG.webServer.smsCodRetryTimeout)
      await this.ctx.state.redis.set(
        limitHourCacheKey,
        this.t.jsonStringify({
          initTime: limitHourCacheCheckObj.initTime || Date.now(),
          count: (limitHourCacheCheckObj.count || 0) + 1,
        }),
        3600 * 24,
      )
      await this.ctx.state.redis.set(
        limitDayCacheKey,
        this.t.jsonStringify({
          initTime: limitDayCacheCheckObj.initTime || Date.now(),
          count: (limitDayCacheCheckObj.count || 0) + 1,
        }),
        3600 * 24,
      )

      this.ctx.state.logger('debug', chalk.magenta('[ALYSMS]'), `${phone}获取${cate}类型验证码：${code}`)

      return code
    } catch (ex) {
      this.ctx.state.logger(ex, '获取阿里云短信验证码失败', `参数：${JSON.stringify(smsOpt)}`, ex)
      throw ex
    }
  }

  /**
   * 发送通知
   *
   * @param {*} phone 大陆手机号码
   * @param {string} [cate='default'] 通知短信分类（notice_babyShare）
   * @param {object} options 参数
   */
  async sendNotice(phone, cate = 'default', options) {
    options = options || {}
    const smsParam = JSON.stringify(options)

    const cacheKey = this.createCacheKey('alySms', cate, this.t.getMd5(this.ctx.userAgent.source), phone)
    const retryCacheKey = this.t.genCacheKey('alySms@retryTimeout', cate, phone)

    const smsOpt = {
      PhoneNumbers: phone,
      TemplateParam: smsParam,
      SignName: smsConf.signName,
      TemplateCode: smsConf.template[cate] || smsConf.template.default,
    }

    try {
      const smsRes = await this.smsClient.sendSMS(smsOpt)
      if (smsRes.Code !== 'OK') {
        if (smsRes.code === 'isv.BUSINESS_LIMIT_CONTROL') {
          throw new ce('eAliyunAPI', 'EClientTooManyRequest')
        }

        this.ctx.state.logger('error', '获取阿里云短信异常：', JSON.stringify(smsRes))
        throw new ce('eAliyunAPI', 'senSMSFailed', smsRes)
      }

      // 设置验证码缓存
      await this.ctx.state.redis.set(cacheKey, smsParam, CONFIG.webServer.smsCodeMaxAge)
      // 设置重试标记
      await this.ctx.state.redis.set(retryCacheKey, `${Date.now()}`, CONFIG.webServer.smsCodRetryTimeout)

      this.ctx.state.logger('debug', chalk.magenta('[ALYSMS]'), `${phone}获取${cate}类型通知短信, options: ${smsParam}`)
    } catch (ex) {
      this.ctx.state.logger(ex, '获取阿里云通知短信失败', `参数：${JSON.stringify(smsOpt)}`, ex)
      throw ex
    }
  }

  /**
   * 查询短信发送详情
   *
   * @param {*} phone 手机号码
   * @param {string} [sendDate=dayjs().format('YYYYMMDD')] 发送日期
   * @param {number} [pageSize=10] 每页大小
   * @param {number} [page=1] 页数
   * @returns {object} alyRes
   */
  async queryDetail(phone, sendDate = dayjs().format('YYYYMMDD'), pageSize = 10, page = 1) {
    pageSize = pageSize > 50 ? 50 : pageSize
    const queryOpt = {
      PhoneNumber: `${phone}`,
      SendDate: `${sendDate}`,
      pageSize: `${pageSize}`,
      CurrentPage: `${page}`,
    }
    try {
      const alyRes = await this.smsClient.queryDetail(queryOpt)
      const { Code, SmsSendDetailDTOs } = alyRes
      if (Code !== 'OK') {
        throw new ce('eAliyunAPI', 'querySMSSendDetailFailed', alyRes)
      }

      this.ctx.state.logger('debug', '查询短信发送详情：', JSON.stringify(alyRes))
      return SmsSendDetailDTOs.SmsSendDetailDTO
    } catch (ex) {
      this.ctx.state.logger(ex, `查询短信发送详情异常：${ex},`, `参数：${JSON.stringify(queryOpt)}`)
      throw ex
    }
  }
}

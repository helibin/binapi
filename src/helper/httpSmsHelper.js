/*
 * @Author: helibin@139.com
 * @Date: 2018-07-31 16:32:39
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-26 11:08:53
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'
import dayjs from 'dayjs'

/** 基础模块 */
import CONFIG from 'config'
import ce from './customError'
import T from './toolkit'

/** 项目模块 */

/** 预处理 */
const smsConf = CONFIG.httpSmsServer

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
  }

  /**
   * 创建短信验证码缓存键值
   *
   * @param {string} cate 短信验证码分类
   * @param {string} clientId 客户端ID
   * @param {string} phone 手机号码
   * @returns {string} 短信验证码缓存键值
   */
  createCacheKey(cate, clientId, phone) {
    return `smsCode@${cate}#user=${CONFIG.webServer.name}:type=httpSms:clientId=${clientId}:phone=${phone}`
  }

  /**
   * 发送验证码
   *
   * @param {string} phone 大陆手机号码
   * @param {string} [cate='default'] 短信验证码分类(bindPhone|signUp|resetPassword...)
   * @param {int} [len=4] 验证码长度
   * @returns {number} code
   */
  async sendSms(phone, cate = 'default', len = 4) {
    const cacheKey = this.createCacheKey(cate, this.t.getMd5(this.ctx.userAgent.source), phone)
    const retryCacheKey = this.t.genCacheKey('httpSms@retryTimeout', cate, phone)

    // 限流, 5/h, 10/day
    const limitHourCacheKey = this.t.genCacheKey('httpSms@limitHour', cate, phone)
    const limitDayCacheKey = this.t.genCacheKey('httpSms@limitDay', cate, phone)

    let smsOpt

    try {
      // 查询重试标记
      const retryCacheCheck = await this.ctx.state.redis.get(retryCacheKey)
      if (!this.t.isEmpty(retryCacheCheck)) {
        throw new ce('eWebServer', 'requestFrequently')
      }

      // 查询限流
      const limitDayCacheCheck = await this.ctx.state.redis.get(limitDayCacheKey)
      let limitDayCacheCheckObj = this.t.jsonParse(limitDayCacheCheck) || {}
      if (!this.t.isEmpty(limitDayCacheCheck)) {
        if (Math.abs(dayjs().diff(limitDayCacheCheckObj.initTime, 'day'))) {
          await this.ctx.state.redis.del(limitDayCacheCheck)
          limitDayCacheCheckObj = {}
        } else if (limitDayCacheCheckObj.count + 1 > CONFIG.webServer.smsCodLimit.day) {
          throw new ce('eWebServer', 'limitRequestPerDay')
        }
      }
      const limitHourCacheCheck = await this.ctx.state.redis.get(limitHourCacheKey)
      let limitHourCacheCheckObj = this.t.jsonParse(limitHourCacheCheck) || {}
      if (!this.t.isEmpty(limitHourCacheCheck)) {
        if (Math.abs(dayjs().diff(limitHourCacheCheckObj.initTime, 'hour'))) {
          await this.ctx.state.redis.del(limitHourCacheCheck)
          limitHourCacheCheckObj = {}
        } else if (limitHourCacheCheckObj.count + 1 > CONFIG.webServer.smsCodLimit.hour) {
          throw new ce('eWebServer', 'limitRequestPerHour')
        }
      }

      const code = this.t.genRandStr(len, '1234567890')
      smsOpt = {
        Id: smsConf.id,
        Name: smsConf.name,
        Psw: smsConf.password,
        Message: `【${smsConf.signName}】您的验证码：${code}, 请勿泄露给他人。`,
        Phone: phone,
        Timestamp: parseInt(Date.now() / 1000),
      }
      await this.ctx.state.axios.run('get', smsConf.api, smsOpt)

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

      this.ctx.state.logger('debug', chalk.magenta('[HttpSms]'), `${phone}获取${cate}类型验证码: ${code}`)

      return code
    } catch (ex) {
      this.ctx.state.logger(ex, '获取Http短信验证码失败', `参数: ${JSON.stringify(smsOpt)}`, ex)
      throw ex
    }
  }
}

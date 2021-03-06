/*
 * @Author: helibin@139.com
 * @Date: 2018-08-08 21:55:49
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:13:51
 */
/** 内建模块 */

/** 第三方模块 */
import ALY from 'aliyun-sdk'
import chalk from 'chalk'
import day from 'dayjs'

/** 基础模块 */
import CONFIG from 'config'
import ce from './customError'
import Log from './logger'
import t from './toolkit'

/** 项目模块 */

/** 预处理 */
// 创建aly产品客户端
const alyClient = (type = 'common') => {
  try {
    const Client = ALY[type.toUpperCase()]
    if (t.isEmpty(Client)) throw new ce('EAliyunAPI', 'initAliyunSDKFailed', { type })
    return new Client({
      accessKeyId: CONFIG.alyServer[type].accessKeyId || CONFIG.alyServer.accessKeyId,
      secretAccessKey: CONFIG.alyServer[type].accessKeySecret || CONFIG.alyServer.accessKeySecret,
      endpoint: CONFIG.alyServer[type].endpoint,
      apiVersion: CONFIG.alyServer[type].apiVersion,
    })
  } catch (ex) {
    Log.logger(ex, '初始化阿里云客户端失败：', JSON.stringify(ex))
  }
}

// 缓存
const alyServerCache = { oss: {} }

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = alyClient
    this.ret = t.initRet()
  }

  async run(type, func, options) {
    return new Promise((resolve, reject) => {
      try {
        this.client(type)[func](options, (err, alyRes) => {
          if (err) reject(new ce('EAliyunAPI', `${type}-${func}Failed`, err))

          resolve(alyRes)
        })
      } catch (ex) {
        reject(ex)
      }
    })
  }

  /**
   * 上传
   *
   * @param {*} ossPath oss路径, 如：static/img/test.txt
   * @param {binary} data 上传数据
   * @returns {object} 公共返回值
   */
  async upload(ossPath, data) {
    if (t.isEmpty(data)) return this.ret

    const opt = {
      Bucket: CONFIG.alyServer.oss.bucketName,
      Key: ossPath,
      Body: data,
      AccessControlAllowOrigin: '',
      ContentType: 'text/plain',
      CacheControl: 'no-cache',
      ContentDisposition: '',
      ContentEncoding: 'utf-8',
      ServerSideEncryption: 'AES256',
    }
    await this.run('oss', 'putObject', opt)
    this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 文件上传至\`${ossPath}\``)

    // 上传成功后, 清理缓存
    if (CONFIG.alyServer.oss.cacheExpire) {
      delete alyServerCache.oss[ossPath]
    }

    return this.ret
  }

  /**
   * 下载
   *
   * @param {*} ossPath oss路径, 如：static/img/test.txt
   * @returns {object} 公共返回值
   */
  async download(ossPath) {
    if (CONFIG.alyServer.oss.cacheExpire && alyServerCache.oss[ossPath]) {
      this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 从\`${ossPath}\`缓存下载文件`)

      this.ret.msg = 'okFromCache'
      this.ret.data = alyServerCache.oss[ossPath]
      return this.ret
    }

    const opt = {
      Bucket: CONFIG.alyServer.oss.bucketName,
      Key: ossPath,
    }

    const ossRes = await this.run('oss', 'getObject', opt)
    this.ctx.state.logger(null, `${chalk.blue('[OSS]')} 从\`${ossPath}\`下载文件`)

    if (CONFIG.alyServer.oss.cacheExpire && ossRes) {
      // 首次下载后, 缓存在Web服务器
      alyServerCache.oss[ossPath] = ossRes.Body

      // 缓存自动销毁
      setTimeout(() => {
        delete alyServerCache.oss[ossPath]
      }, CONFIG.alyServer.oss.cacheExpire * 1000)
    }

    this.ret.data = ossRes.Body
    return this.ret
  }

  async sendSms(mobile, type = 'default') {
    const code = t.genRandStr(6, '1234567890')
    const cache = t.genCacheKey('alySms', mobile, type)
    const retryCacheKey = t.genCacheKey('alySms@retryTimeout', mobile)
    this.ctx.state.logger('debug', chalk.magenta('[AlySms]'), `${mobile}获取${type}类型验证码：${code}`)

    // 查询重试标记
    const retryCacheCheck = await this.ctx.state.redis.get(retryCacheKey)
    if (!t.isEmpty(retryCacheCheck)) {
      throw new ce('EAliyunAPI', 'EClientTooManyRequest')
    }

    const opt = {
      rec_num: mobile,
      sms_template_code: CONFIG.alyServer.dayu.template[type],
      sms_free_sign_name: CONFIG.alyServer.dayu.signName,
      sms_param: { code },
    }
    const smsRes = await this.run('dayu', 'sendSms', opt)
    if (smsRes.Code !== 'OK') {
      if (smsRes.code === 'isv.BUSINESS_LIMIT_CONTROL') {
        throw new ce('EAliyunAPI', 'EClientTooManyRequest')
      }

      this.ctx.state.logger('error', '获取阿里云短信异常：', JSON.stringify(smsRes))
      throw new ce('EAliyunAPI', 'senSmsFailed', smsRes)
    }

    // 设置验证码缓存
    await this.ctx.state.redis.set(cache, code, CONFIG.webServer.smsCodeMaxAge.aly)
    // 设置重试标记
    await this.ctx.state.redis.set(retryCacheKey, `${Date.now()}`, CONFIG.webServer.smsCodRetryTimeout.aly)

    return smsRes
  }

  /**
   * 查询短信发送详情
   *
   * @param {*} mobile 手机号码
   * @param {string} [sendDate=day().format('YYYYMMDD')] 发送日期
   * @param {number} [page=1] 当前页数
   * @param {number} [pageSize=10] 每页大小
   * @returns {object} alyRes
   */
  async querySms(mobile, sendDate = day().format('YYYYMMDD'), page = 1, pageSize = 10) {
    pageSize = pageSize > 50 ? 50 : pageSize
    const opt = {
      rec_num: mobile,
      query_date: sendDate,
      current_page: `${page}`,
      page_size: `${pageSize}`,
    }
    const alyRes = await this.run('dayu', 'querySms', opt)
    const { Code, SmsSendDetailDTOs } = alyRes
    if (Code !== 'OK') {
      throw new ce('EAliyunAPI', 'querySmsFailed', alyRes)
    }

    this.ctx.state.logger('debug', '查询短信发送详情：', JSON.stringify(alyRes))
    return SmsSendDetailDTOs.SmsSendDetailDTO
  }

  async genAlyCoupon(uid = 0, activityCode) {
    const opt = {
      Uid: Number(uid),
      FromAppName: 'bin-api',
      ActivityCode: activityCode,
    }

    const alyRes = await this.run('yqBridge', 'lotteryDraw', opt)

    this.ctx.state.logger(null, `${chalk.blue('[yqBridge]')}为用户${uid}生成代金券`)
    return alyRes.data
  }

  /**
   * 获取用户会话信息
   *
   * @param {string} [alyTicket=''] 阿里云会话凭证, 取至cookie的login_aliyunid_ticket
   * @returns {object} sessionInfo
   */
  async getSessionInfo(alyTicket = '') {
    const opt = { Ticket: `${alyTicket}` }

    const alyRes = await this.run('aas', 'getSessionInfoByTicket', opt)

    if (!t.isEmpty(alyRes) && !t.isEmpty(alyRes.SessionInfo)) {
      try {
        this.ret.data = JSON.parse(alyRes.SessionInfo) || {}
      } catch (ex) {
        this.ctx.state.logger(ex, `JSON-alyRes.SessionInfo解析失败：${alyRes.SessionInfo}`)
      }
    }

    if (!t.isEmpty(this.ret.data)) {
      const accountType = this.ret.data.accountStructure || 1
      this.ret.data.type = CONFIG.alyServer.aas.type[accountType - 1]
    }
    this.ctx.state.logger(null, `${chalk.blue('[ass]')}获取阿里用户信息, ticKet=${alyTicket}`)
    return this.ret.data
  }
}

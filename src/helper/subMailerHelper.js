/*
 * @Author: helibin@139.com
 * @Date: 2018-08-02 21:26:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 23:19:40
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import t from './toolkit'
import ce from './customError'

/** 项目模块 */

/** 预处理 */
const subMailConf = CONFIG.subMailerServer

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.ret = t.initRet()
  }

  async sendMail(email, type = 'default') {
    const now = parseInt(Date.now(), 10)
    const opt = {
      appid: subMailConf.mail.accessKeyId,
      signature: subMailConf.mail.accessKeySecret,
      to: email,
      project: subMailConf.mail.template[type],
    }
    try {
      this.ctx.state.axios.post('https://api.mysubmail.com/mail/xsend', opt)
      return this.ret.data
    } catch (ex) {
      this.ctx.state.logger(ex, ex, opt)
      throw ex
    } finally {
      this.ctx.state.logger('info', `发送邮件至\`${email}\`，用时：${Date.now() - now}ms`)
    }
  }

  /**
   * 发送短信
   *
   * @param {string} mobile 大陆手机号码
   * @param {string} [type='default'] 发送类型
   * @param {*} options 模板参数
   * @returns {object} 公共返回值
   */
  async sendSMS(mobile, type = 'default', options) {
    const now = parseInt(Date.now(), 10)
    const opt = {
      appid: subMailConf.sms.accessKeyId,
      signature: subMailConf.sms.accessKeySecret,
      to: mobile,
      project: subMailConf.sms.template[type],
      vars: options || { code: t.genRandStr(6, '1234567890') },
    }
    try {
      const smsRes = await this.ctx.state.axios.post('https://api.mysubmail.com/message/xsend', opt)

      if (smsRes.status === 'error') {
        this.ctx.state.logger('error', '获取赛邮短信异常：', JSON.stringify(smsRes))
        throw new ce('ESubMailAPI', smsRes.msg)
      }

      return this.ret
    } catch (ex) {
      this.ctx.state.logger(ex, ex, opt)
      throw ex
    } finally {
      this.ctx.state.logger('info', `发送短信至\`${mobile}\`，用时：${Date.now() - now}ms`)
    }
  }

  async queryDetail(mobile, type = 'default') {
    const now = parseInt(Date.now(), 10)
    const queryOpt = {
      appid: subMailConf.sms.accessKeyId,
      signature: subMailConf.sms.accessKeySecret,
      recipient: mobile,
      project: subMailConf.sms.template[type],
    }
    try {
      const smsRes = await this.ctx.state.axios.post('https://api.mysubmail.com/log/message', queryOpt)
      if (smsRes.data.status === 'error') {
        this.ctx.state.logger('error', '查询赛邮短信异常：', JSON.stringify(smsRes.data))
        throw new ce('ESubMailAPI', smsRes.data.msg)
      }

      this.ret.data = smsRes.data.results
      return this.ret
    } catch (ex) {
      this.ctx.state.logger(ex, ex, queryOpt)
      throw ex
    } finally {
      this.ctx.state.logger('info', `查询短信用时：${Date.now() - now}ms`)
    }
  }
}

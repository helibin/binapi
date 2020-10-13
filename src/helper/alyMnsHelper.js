/*
 * @Author: helibin@139.com
 * @Date: 2018-10-06 16:01:07
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-16 18:13:59
 */
/** 内建模块 */

/** 第三方模块 */
import AliMns from 'ali-mns'
import chalk from 'chalk'

/** 基础模块 */
import CONFIG from 'config'
import t from './toolkit'
import ce from './customError'

/** 项目模块 */
import Log from './logger'

// 缓存
const mnsConf = CONFIG.alyServer.mns
const alyAk = mnsConf.accessKeyId || CONFIG.alyServer.accessKeyId
const alyAs = mnsConf.accessKeySecret || CONFIG.alyServer.accessKeySecret
const mqId = mnsConf.mqId
let client = {}

try {
  if (alyAk && alyAs && mqId) {
    const account = new AliMns.Account(mnsConf.accountId, alyAk, alyAs)
    client = new AliMns.MQ(mqId, account, mnsConf.regionName)
  } else {
    Log.logger('error', 'alyMns服务缺少参数  : ', `alyAk='${alyAk}', alyAs='${alyAs}', mqId=${mqId}`)
  }
} catch (ex) {
  Log.logger(ex, '初始化阿里云客户端失败: ', JSON.stringify(ex))
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = client
    this.t = t
  }

  async run(func, ...args) {
    const now = Date.now()
    try {
      if (typeof this[func] === 'function') {
        return await this[func](...args)
      }

      return await this.client[func](...args)
    } catch (ex) {
      if (ex.Error && ex.Error.Code === 'MessageNotExist') return {}
      this.ctx.state.hasError = true
      this.ctx.state.logger('error', `MNS调用方法: [${chalk.magenta(func)}]发生异常: `, ex)

      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        `MNS调用方法: [${chalk.magenta(func)}], `,
        `响应: ${this.ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时: ${Date.now() - now}ms`),
      )
    }
  }

  async sendMsg(deviceCode, msg) {
    const now = Date.now()
    try {
      const productKey = CONFIG.alyServer.iot.productKey

      return await this.ctx.state.alyPop.iot('Pub', {
        TopicFullName: `/${productKey}/${deviceCode}/user/rgetpare`,
        MessageContent: this.t.base64Encode(msg),
        ProductKey: productKey,
      })
    } catch (ex) {
      this.ctx.state.hasError = true
      this.ctx.state.logger('error', `调用Pub方法发生异常, deviceCode=${deviceCode}, `, `msg=${msg}, 原因: `, ex)
      if (ex.Error && ex.Error.Code) throw new ce('eAliyunAPI', 'MessageNotExist')

      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        `MNS调用方法: [${chalk.magenta('Pub')}], `,
        `响应: ${this.ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时: ${Date.now() - now}ms`),
      )
    }
  }
}

// https://github.com/InCar/ali-mns

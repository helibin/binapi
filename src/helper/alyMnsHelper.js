/*
 * @Author: helibin@139.com
 * @Date: 2018-10-06 16:01:07
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 09:17:52
 */
/** 内建模块 */

/** 第三方模块 */
import AliMNS from 'ali-mns'
import chalk from 'chalk'

/** 基础模块 */
import CONFIG from 'config'
import T from './toolkit'

/** 项目模块 */
import { logger } from './logger'

// 缓存
const mnsConf = CONFIG.alyServer.mns
const alyAK = mnsConf.accessKeyId || CONFIG.alyServer.accessKeyId
const alyAS = mnsConf.accessKeySecret || CONFIG.alyServer.accessKeySecret
let client = {}

if (alyAK && alyAS && mnsConf.accountId) {
  const account = new AliMNS.Account(mnsConf.accountId, alyAK, alyAS)
  client = new AliMNS.MQ(mnsConf.mqId, account, mnsConf.regionName)
} else {
  logger('error', 'alyMns服务缺少参数  ：', `alyAK='${alyAK}', alyAS='${alyAS}', accountId='${mnsConf.accountId}'`)
}

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.client = client
    this.t = T
  }

  async run(func, ...args) {
    const now = Date.now()
    try {
      if (typeof this[func] === 'function') {
        return await this[func](...args)
      }

      return await this.client[func](...args)
    } catch (ex) {
      this.ctx.state.logger('error', `MNS调用方法：[${chalk.magenta(func)}]发生异常：`, ex)
      this.ctx.state.hasError = true

      throw ex
    } finally {
      this.ctx.state.logger(
        this.ctx.state.hasError,
        `MNS调用方法：[${chalk.magenta(func)}], `,
        `响应：${this.ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
    }
  }
}

// https://github.com/InCar/ali-mns

/*
 * @Author: helibin@139.com
 * @Date: 2018-08-06 14:25:59
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-12-16 21:54:13
 */
/** 内建模块 */

/** 第三方模块 */
import axios from 'axios'
import chalk from 'chalk'

/** 基础模块 */
import ce from './customError'

/** 项目模块 */

/** 预处理 */
axios.defaults.timeout = 10 * 1000

axios.interceptors.request.use(
  conf => conf,
  err => Promise.reject(err),
)
axios.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response ? err.response.data : err),
)

export default class {
  constructor(ctx) {
    this.ctx = ctx
  }

  async run(func, ...args) {
    try {
      this.ctx.state.logger('info', '发起第三方请求: ', ...args)

      const httpRes = await this[func](...args)

      this.ctx.state.logger('debug', '第三方请求成功, 响应值: ', httpRes)
      return httpRes
    } catch (ex) {
      this.ctx.state.logger(ex, `执行${chalk.magenta(func)}时发生异常`, ex)
      if (ex instanceof Error) {
        throw new ce('eOpenAPI', ex.code, {
          code: ex.code,
          errno: ex.errno,
          msg: ex.message,
        })
      }

      throw ex
    }
  }

  async post(url, data, options) {
    data = data || {}
    return await axios({ method: 'POST', url, data, ...options })
  }

  async get(url, params, options) {
    params = params || {}
    return await axios({ method: 'GET', url, params, ...options })
  }
}

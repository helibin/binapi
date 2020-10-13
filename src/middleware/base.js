/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-18 10:47:22
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'

/** 基础模块 */
import { CONFIG, T, ce } from '../helper'

/** 项目模块 */

export default class {
  constructor() {
    this.CONFIG = CONFIG
    this.ce = ce
    this.t = T
  }

  run(func, ...args) {
    return async (ctx, next) => {
      const now = Date.now()
      try {
        await this[func](ctx, ...args)
      } catch (ex) {
        ctx.state.hasError = true

        throw ex
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Mid:<${this.mid}>调用方法: [${chalk.magenta(func)}] ${ctx.state.hasError ? '终止' : '通过'},`,
          chalk.green(`用时: ${Date.now() - now}ms`),
        )
      }
      return await next()
    }
  }
}

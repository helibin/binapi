/*
 * @Author: helibin@139.com
 * @Date: 2019-04-19 10:04:42
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-24 16:07:19
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'

/** 基础模块 */
import { CONFIG, T, YamlCC, ce } from '../helper'

/** 项目模块 */

export default class {
  constructor() {
    this.CONFIG = CONFIG
    this.CONST = YamlCC.CONST
    this.ce = ce
    this.t = T
  }

  async run(ctx, func, ...args) {
    const now = Date.now()
    try {
      if (typeof this[func] === 'function') {
        return await this[func](ctx, ...args)
      }

      throw new ce('eWebServer', `\`${func}\`IsNotFunction`)
    } catch (ex) {
      ctx.state.hasError = true
      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Proxy调用方法：[${chalk.magenta(func)}],`,
        `响应：${ctx.state.hasError ? '异常' : '正常'},`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
    }
  }
}

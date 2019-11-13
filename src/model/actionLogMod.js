/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 10:08:56
 */
/** 内建模块 */

/** 第三方模块 */
import dayjs from 'dayjs'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Scm from '../schema'

module.exports = new (class extends Base {
  constructor() {
    super()
    this.model = Scm.actionLogScm
  }

  async addData(ctx, action, actionMsg, user = ctx.state.user.name || ctx.state.user.identifier, type = 'sys') {
    return await this.add(ctx, {
      id: this.t.genUUID(),
      type,
      action,
      api: ctx.url,
      content: `用户'${user}'${actionMsg}, 时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      extra_info: {
        ip: ctx.state.clientIp,
        ua: ctx.userAgent.source,
        browser: ctx.userAgent.browser || null,
        version: ctx.userAgent.version || null,
        os: ctx.userAgent.os || null,
        platform: ctx.userAgent.platform || null,
      },
    })
  }
})()

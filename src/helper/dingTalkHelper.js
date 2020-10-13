/*
 * @Author: helibin@139.com
 * @Date: 2018-12-05 16:29:32
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-08-10 16:37:21
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import T from './toolkit'
import ce from './customError'

/** 项目模块 */

/** 预处理 */
const dingTalkConf = CONFIG.dingTalkServer

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
  }

  async _request(api, param) {
    const dingTalkRes = await this.ctx.state.axios
      .run('post', api, param, {
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(async ex => {
        this.ctx.state.logger(ex, 'dingTalk发生异常：', ex)
        ex = await this.t.parseXML(ex)
        throw new ce('EWorkwxAPI', ex, param)
      })

    this.ctx.state.logger('debug', 'dingTalk返回值：', dingTalkRes)
    if (dingTalkRes.errcode) {
      throw new ce('EWorkwxAPI', dingTalkRes.errmsg, ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : param)
    }

    return dingTalkRes
  }

  async send(template, mobileList = [], ...args) {
    const param = {
      msgtype: 'text',
      text: {
        content: this.t.strf(dingTalkConf.notifyTemplate[template], ...args),
      },
      at: {
        atMobiles: mobileList,
        isAtAll: false,
      },
    }

    this.ctx.state.logger('info', '调用钉钉群机器人webhook-send，参数：', JSON.stringify(param))
    return await this._request(dingTalkConf.webhook.send + dingTalkConf.webhook.key, param)
  }
}

// https://work.weixin.qq.com/api/doc#90000/90136/91770

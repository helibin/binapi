/*
 * @Author: helibin@139.com
 * @Date: 2018-12-05 16:29:32
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 23:24:32
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import T from './toolkit'
import ce from './customError'

/** 项目模块 */

/** 预处理 */
const wxWorkConf = CONFIG.wxWorkServer

export default class {
  constructor(ctx) {
    this.ctx = ctx
    this.t = T
  }

  async _request(api, param) {
    const wxWorkRes = await this.ctx.state.axios
      .run('post', api, param, {
        headers: { 'Content-Type': 'application/json' },
      })
      .catch(async ex => {
        this.ctx.state.logger(ex, 'workwx发生异常：', ex)
        ex = await this.t.parseXML(ex)
        throw new ce('EWorkwxAPI', ex, param)
      })

    this.ctx.state.logger('debug', 'workwx返回值：', wxWorkRes)
    if (wxWorkRes.errcode) {
      throw new ce('EWorkwxAPI', wxWorkRes.errmsg, ['prod', 'qa'].includes(process.env.NODE_ENV) ? undefined : param)
    }

    return wxWorkRes
  }

  async send(template, mobileList = [], ...args) {
    const param = {
      msgtype: 'text',
      text: {
        content: this.t.strf(wxWorkConf.notifyTemplate[template], ...args),
        mentioned_mobile_list: mobileList,
      },
    }

    this.ctx.state.logger('info', '调用企业微信群机器人webhook-send, 参数：', JSON.stringify(param))
    return await this._request(wxWorkConf.webhook.send + wxWorkConf.webhook.key, param)
  }
}

// https://work.weixin.qq.com/api/doc#90000/90136/91770

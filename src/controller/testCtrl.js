/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-07-24 14:35:39
 */
/** 内建模块 */
import fs from 'fs'

/** 第三方模块 */
// import casbin from 'casbin'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'
import authCtrl from './authCtrl'

module.exports = new (class extends Base {
  async test(ctx) {
    const ret = this.t.initRet()

    ret.data = { query: ctx.query, body: ctx.request.body }

    ctx.state.sendJSON(ret)
  }

  async getSTSToken(ctx) {
    const stsToken = await ctx.state.alyOss.getSTSUploadToken('test', 60 * 60)
    ctx.state.sendJSON(
      this.t.initRet({
        sts_token: stsToken,
      }),
    )
  }
})()

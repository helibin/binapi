/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-02 18:01:45
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async changePassword(ctx) {
    const ret = this.t.initRet()
    const body = ctx.request.body
    const userId = ctx.state.userId

    // 密码比对
    if (this.t.getSaltedHashStr(body.old_password.toUpperCase(), userId) !== ctx.state.user.password)
      throw new this.ce('invalidOldPassword')

    const nextData = { password: this.t.getSaltedHashStr(body.new_password.toUpperCase(), userId) }

    await Mod.muserMod.modify(ctx, userId, nextData)

    ctx.state.sendJSON(ret)
  }

  async getUser(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.state.userId

    const dbRes = ctx.state.user

    // 处理返回数据
    ret.data = this.t.safeData(dbRes)

    ctx.state.logger('debug', `获取我的用户信息: targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async downloadAvatar(ctx, filePathPatten) {
    const targetId = ctx.params.targetId
    const filename = ctx.params.filename
    const suffix = filename.split('.').slice(-1)[0]

    const opt = {}
    if (ctx.query['x-oss-process'] && Object.keys(this.CONST.mimeType.image).includes(suffix)) {
      opt.process = ctx.query['x-oss-process']
    }

    const ossPath = this.t.strf(filePathPatten, targetId, filename)
    const file = await ctx.state.alyOss.download(ossPath, opt)

    ctx.state.logger('debug', `下载用户头像: targetId=${targetId}`)
    ctx.state.sendMedia(file, suffix)
  }

  async bindPhone(ctx) {
    // 修改用户资料
    await Mod.userMod.run(ctx, 'bindPhone', ctx.state.userId, { phone: ctx.request.body.phone })

    ctx.state.sendJSON()
  }
})()

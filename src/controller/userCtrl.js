/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 20:31:26
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'
import authCtrl from './authCtrl'

module.exports = new (class extends Base {
  async list(ctx) {
    const ret = this.t.initRet()
    const qFields = ['name', 'phone']

    ret.data = await Mod.usersMod.run(ctx, 'list', {}, { qFields })

    ctx.state.logger('debug', '列出用户')
    ctx.state.sendJSON(ret)
  }

  async get(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    ret.data = await Mod.usersMod.run(ctx, 'get', targetId)

    ctx.state.logger('debug', `获取用户：userId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async add(ctx) {
    const body = ctx.request.body
    const ret = this.t.initRet()
    const newId = this.t.genUUID()

    const newData = {
      ...body,
      id: newId,
    }

    const passwordMd5 = newData.password || this.t.getMd5(this.CONFIG.webServer.defaultPassword)
    newData.password = this.t.getSaltedHashStr(passwordMd5.toUpperCase(), newId)

    // 新增用户
    await Mod.usersMod.run(ctx, 'addData', newData)

    ctx.state.logger('debug', `添加新用户：userId=${newId}`)
    ret.data = { new_data_id: newId }
    ctx.state.sendJSON(ret)
  }

  async modify(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const nextData = ctx.request.body

    await Mod.usersMod.modify(ctx, targetId, nextData)

    if ([1, true, 'true'].includes(nextData.is_disabled)) {
      // 收回令牌
      const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(targetId)
      await ctx.state.redis.del(xAuthTokenCacheKey)
    }

    ctx.state.logger('debug', `修改用户：userId=${targetId}`, nextData)
    ctx.state.sendJSON(ret)
  }

  async setDisable(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const { is_disabled } = ctx.request.body

    await Mod.userMod.modify(ctx, targetId, { is_disabled })

    if ([1, true, 'true'].includes(is_disabled)) {
      // 收回令牌
      const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(targetId)
      await ctx.state.redis.del(xAuthTokenCacheKey)
    }

    ctx.state.logger('debug', `${is_disabled ? '禁' : '启'}用注册用户：targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async delete(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    await Mod.usersMod.run(ctx, 'deleteData', targetId)

    ctx.state.logger('debug', `删除用户：userId=${targetId}`)
    ctx.state.sendJSON(ret)
  }
})()

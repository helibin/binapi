/*
 * @Author: helibin@139.com
 * @Date: 2018-09-13 16:29:39
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-05 12:02:03
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'
import authCtrl from './authCtrl'

module.exports = new (class extends Base {
  async query(ctx) {
    const ret = this.t.initRet()
    const qFields = ['name', 'phone']
    const { id } = ctx.query

    ret.data = await Mod.muserMod[id ? 'get' : 'list'](ctx, null, { qFields })

    ctx.state.logger('debug', '查询管理用户')
    ctx.state.sendJSON(ret)
  }

  async add(ctx) {
    const ret = this.t.initRet()
    const newData = ctx.request.body
    const newId = this.t.genUUID()

    newData.id = newId
    newData.password = this.t.getSaltedHashStr(
      (newData.password || this.t.getMd5(this.CONFIG.webServer.defaultPassword)).toUpperCase(),
      newId,
    )

    await Mod.muserMod.add(ctx, newData)
    ret.data = { new_id: newId }

    ctx.state.logger('debug', `新增管理用户: id=${newId}`, newData)
    ctx.state.sendJSON(ret)
  }

  async modify(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const nextData = ctx.request.body

    if (nextData.password) {
      nextData.password = this.t.getSaltedHashStr(
        (nextData.password || this.t.getMd5(this.CONFIG.webServer.defaultPassword)).toUpperCase(),
        targetId,
      )
    } else {
      delete nextData.password
    }

    // sa用户禁止禁用自己
    if ([1, true, 'true'].includes(nextData.is_disabled)) {
      if (targetId === 'xu_sa') throw new this.ce('requestForbidden', 'canNotDoThisForSA')

      // 收回令牌
      const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(targetId)
      await ctx.state.redis.del(xAuthTokenCacheKey)
    }

    await Mod.muserMod.modify(ctx, targetId, nextData)

    ctx.state.logger('debug', `修改管理用户：targetId=${targetId}`, nextData)
    ctx.state.sendJSON(ret)
  }

  async setDisable(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const body = ctx.request.body

    if (body.is_disabled && ['xu_sa', ctx.state.userId].includes(targetId)) throw new this.ce('requestForbidden')

    await Mod.muserMod.modify(ctx, targetId, body)

    // 收回令牌
    const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(targetId)
    await ctx.state.redis.del(xAuthTokenCacheKey)

    ctx.state.logger('debug', `启禁用管理用户：targetId=${targetId}`, body)
    ctx.state.sendJSON(ret)
  }

  async delete(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    // sa用户禁止删除自己
    if (targetId === 'xu_sa') throw new this.ce('requestForbidden', 'canNotDoThisForSA')

    await Mod.muserMod.delete(ctx, targetId)

    ctx.state.logger('debug', `删除管理用户：targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async genSA(ctx) {
    const ret = this.t.initRet()
    const whereOpt = { identifier: 'sa' }
    const dbCheck = await Mod.muserMod.run(ctx, 'get', whereOpt)
    if (!this.t.isEmpty(dbCheck)) throw new this.ce('muserExisted')

    const saId = 'xu_sa'
    const saData = {
      id: saId,
      identifier: 'sa',
      password: this.t.getSaltedHashStr(ctx.query.password.toUpperCase(), saId),
      name: '超级管理员',
      phone: '13812341234',
      email: 'sa@opo.top',
      type: 'admin',
      privileges: '*',
    }

    await Mod.muserMod.run(ctx, 'add', saData)
    ret.data = { new_id: saId }

    ctx.state.logger('debug', `生成SA管理用户: id=${saId}`, saData)
    ctx.state.sendJSON(ret)
  }
})()

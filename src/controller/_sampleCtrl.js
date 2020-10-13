/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-01-02 14:29:45
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async query(ctx) {
    const ret = this.t.initRet()
    const { id } = ctx.query

    ret.data = await Mod.sampleMod[id ? 'get' : 'list'](ctx, id)

    ctx.state.logger('debug', `获取样板数据`)
    ctx.state.sendJSON(ret)
  }

  async list(ctx) {
    const ret = this.t.initRet()

    ret.data = await Mod.sampleMod.list(ctx)

    ctx.state.logger('debug', `列出样板数据`)
    ctx.state.sendJSON(ret)
  }

  async get(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    ret.data = await Mod.sampleMod.get(ctx, targetId)

    ctx.state.logger('debug', `获取样板数据: targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async add(ctx) {
    const ret = this.t.initRet()
    const newData = ctx.request.body
    const newId = this.t.genUUID()

    newData.id = newId

    await Mod.sampleMod.add(ctx, newData)
    ret.data = { new_id: newId }

    ctx.state.logger('debug', `新增样板数据: id=${newId}`, newData)
    ctx.state.sendJSON(ret)
  }

  async modify(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const nextData = ctx.request.body

    await Mod.sampleMod.modify(ctx, targetId, nextData)

    ctx.state.logger('debug', `修改样板数据: targetId=${targetId}`, nextData)
    ctx.state.sendJSON(ret)
  }

  async setDisable(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const is_disabled = ctx.request.body.is_disabled

    await Mod.sampleMod.modify(ctx, targetId, { is_disabled })

    ctx.state.logger('debug', `修改样板数据: targetId=${targetId}`, { is_disabled })
    ctx.state.sendJSON(ret)
  }

  async delete(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    await Mod.sampleMod.delete(ctx, targetId)

    ctx.state.logger('debug', `删除样板数据: targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }
})()

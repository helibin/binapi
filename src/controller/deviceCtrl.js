/*
 * @Author: helibin@139.com
 * @Date: 2018-10-09 10:27:08
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 11:35:19
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mod from '../model'

module.exports = new (class extends Base {
  async add(ctx) {
    const ret = this.t.initRet()
    const body = ctx.request.body
    const deviceConf = this.CONFIG.alyServer.iot

    const newId = this.t.genUUID()
    const newData = {
      ...body,
      id: newId,
      code: body.code,
      name: body.code,
      key: deviceConf.productKey,
    }
    await Mod.deviceMod.run(ctx, 'addData', newData).catch(async ex => {
      await ctx.state.alyPop.iot('DeleteDevice', { ProductKey: deviceConf.productKey, DeviceName: body.code })

      throw ex
    })

    ret.data = { new_id: newId }

    ctx.state.sendJSON(ret)
  }

  async modify(ctx) {
    const ret = this.t.initRet()
    const body = ctx.request.body
    const targetId = ctx.params.targetId

    await Mod.deviceMod.modify(ctx, targetId, body)

    ctx.state.sendJSON(ret)
  }

  async setDisable(ctx) {
    const ret = this.t.initRet()
    const { is_disabled } = ctx.request.body
    const targetId = ctx.params.targetId

    await Mod.deviceMod.run(ctx, 'setDisableData', targetId, is_disabled)

    ctx.state.sendJSON(ret)
  }

  async delete(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    await Mod.deviceMod.run(ctx, 'deleteData', targetId)

    ctx.state.sendJSON(ret)
  }
})()

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 11:36:39
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Scm from '../schema'

module.exports = new (class extends Base {
  constructor() {
    super()
    this.model = Scm.deviceScm
  }

  async addData(ctx, data) {
    ctx.state.trans = await this.sequelize.transaction()

    // 增加记录
    const dbRes = await this.add(ctx, data, { transaction: ctx.state.trans })

    // iot创建设备
    const iotRes = await ctx.state.alyPop.iot('RegisterDevice', { DeviceName: data.name })

    // 修改记录
    await this.modify(ctx, data.id, { secret: iotRes.DeviceSecret, iot_info: iotRes }, { transaction: ctx.state.trans })

    return dbRes
  }

  async setDisableData(ctx, targetId, isDisabled) {
    ctx.state.trans = await this.sequelize.transaction()
    const bizData = ctx.state.biz_device

    const dbRes = await this.modify(ctx, targetId, { is_disable: isDisabled }, { transaction: ctx.state.trans })

    // iot修改设备
    await ctx.state.alyPop.iot(isDisabled ? 'DisableThing' : 'EnableThing', { IotId: bizData.iot_info.IotId })

    return dbRes
  }

  async deleteData(ctx, targetId) {
    ctx.state.trans = await this.sequelize.transaction()
    const bizData = ctx.state.biz_device

    const dbRes = await this.delete(ctx, targetId, { transaction: ctx.state.trans })

    // iot删除设备
    await ctx.state.alyPop.iot('DeleteDevice', { IotId: bizData.iot_info.IotId })

    return dbRes
  }
})()

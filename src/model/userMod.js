/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-23 20:54:02
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
    this.model = Scm.userScm
  }

  async add(ctx, data) {
    ctx.state.trans = await this.sequelize.transaction()
    // auth表增加记录
    const dbRes = await Scm.AuthScm.create(
      {
        id: this.t.genUUID(),
        user_id: data.id,
        identifier: data.identifier,
        unique_id: data.unique_id,
      },
      { transaction: ctx.state.trans },
    )

    // user表增加记录
    await this.add(ctx, data, { transaction: ctx.state.trans })

    return dbRes
  }

  async delete(ctx, targetId) {
    ctx.state.trans = await this.sequelize.transaction()

    await Scm.AuthScm.destroy({
      where: { user_id: targetId },
      transaction: ctx.state.trans,
    })
    return await this.delete(ctx, targetId, { transaction: ctx.state.trans })
  }
})()

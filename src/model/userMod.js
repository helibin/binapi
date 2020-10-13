/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-03 10:38:08
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

  async getData(ctx, targetId, extraOpt) {
    extraOpt = extraOpt || {}
    extraOpt.noPassword = extraOpt.noPassword || true
    extraOpt.auth_from = extraOpt.auth_from || 'wechat.mp'

    extraOpt = Object.assign(
      {
        attributes: {
          exclude: ['seq', 'creator_id', 'editor_id', 'other_info', extraOpt.noPassword ? 'password' : ''],
        },
        include: [
          {
            model: Scm.authScm,
            as: 'auth_list',
            attributes: [],
          },
        ],
      },
      extraOpt,
    )
    const userRes = await this.get(ctx, targetId, extraOpt)
    if (this.t.isEmpty(userRes)) return userRes

    const authRes = await userRes.getAuth_list({ raw: true })

    // wechat
    const wechatRes = authRes.find(d => d.type === 'wechat' && (d.from === ctx.state.authType || 'wechat.mp'))

    // order
    const orderRes = await Mod.orderMod.get(ctx, { user_id: targetId, status: ['paying', 'charging'] })

    const userResFormat = await userRes.get()
    return this.t.jsonFormat({
      ...userResFormat,
      wechat: wechatRes && wechatRes.auth_info,
      order: orderRes.id && {
        id: orderRes.id,
        status: orderRes.status,
        pay_info: orderRes.pay_info,
      },
    })
  }

  async addData(ctx, data) {
    ctx.state.trans = await this.sequelize.transaction()
    // auth表增加记录
    const dbRes = await Scm.authScm.create(
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

  async deleteData(ctx, targetId) {
    ctx.state.trans = await this.sequelize.transaction()

    await Scm.AuthScm.destroy({
      where: { user_id: targetId },
      transaction: ctx.state.trans,
    })
    return await this.delete(ctx, targetId, { transaction: ctx.state.trans })
  }

  async bindPhone(ctx, targetId, data) {
    ctx.state.transaction = await this.sequelize.transaction()
    const authCheck = await Mod.authMod.get(ctx, { user_id: targetId, from: 'phone' })

    if (this.t.isEmpty(authCheck)) {
      const newAuthData = {
        id: this.t.genUUID(),
        user_id: targetId,
        identifier: data.phone,
        type: 'account',
        from: 'phone',
      }
      await Mod.authMod.add(ctx, newAuthData, { transaction: ctx.state.transaction })
    } else {
      await Mod.authMod.modify(
        ctx,
        authCheck.get('id'),
        { identifier: data.phone },
        { transaction: ctx.state.transaction },
      )
    }

    const dbRes = await Mod.userMod.modify(ctx, targetId, this.t.jsonFormat(data), {
      transaction: ctx.state.transaction,
    })

    return dbRes
  }
})()

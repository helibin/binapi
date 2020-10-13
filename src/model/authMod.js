/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-03 10:22:31
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Scm from '../schema'
import userMod from './userMod'

module.exports = new (class extends Base {
  constructor() {
    super()
    this.model = Scm.authScm
  }

  /**
   * 第三方登录
   * 1. 首次登录, 新增auth数据和user数据
   *    注意: 微信不同应用登录需先判断是否首次登录
   * 2. 再次登录,
   *    - 相同应用, 更新auth数据
   *    - 不同应用, 新增auth数据
   *
   * @param {*} ctx ctx上下文
   * @param {*} data auth数据
   */
  async signInByOAuth(ctx, data) {
    ctx.state.transaction = await this.sequelize.transaction()

    // 用户登录校验
    const authResList = await this.list(ctx, { type: data.type, unique_id: data.unique_id }, { raw: true })
    const authRes = authResList.find(d => data.identifier === d.identifier)

    // 初始返回值
    const oAuthRet = { userId: null, isNewUser: this.t.isEmpty(authResList), isNewAuth: this.t.isEmpty(authRes) }

    // 已有AUTH信息
    if (oAuthRet.isNewUser) {
      // 新增auth记录
      data.id = this.t.genUUID()
      oAuthRet.userId = this.t.genUUID()
      data.user_id = oAuthRet.userId
      await this.add(ctx, data, { transaction: ctx.state.transaction })
      // 新增用户记录
      await userMod.add(ctx, { id: oAuthRet.userId }, { transaction: ctx.state.transaction })
    } else {
      if (oAuthRet.isNewAuth) {
        // 查找已有用户ID
        oAuthRet.userId = authResList[0].user_id

        // 新增auth记录
        data.id = this.t.genUUID()
        data.user_id = oAuthRet.userId
        await this.add(ctx, data, { transaction: ctx.state.transaction })
      } else {
        oAuthRet.userId = authRes.user_id

        // 兼容老用户
        if (this.t.isEmpty(oAuthRet.userId)) {
          oAuthRet.userId = this.t.genUUID()

          await userMod.add(ctx, { id: oAuthRet.userId }, { transaction: ctx.state.transaction })
        }

        // 更新auth
        await this.modify(
          ctx,
          authRes.id,
          { auth_info: data.auth_info, user_id: oAuthRet.userId },
          { transaction: ctx.state.transaction },
        )

        console.log(data.auth_info, 'data.auth_info,,,')
      }
    }

    return oAuthRet
  }
})()

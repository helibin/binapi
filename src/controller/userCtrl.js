/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:54:18
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import { usersMod } from '../model'
import authCtrl from './authCtrl'

module.exports = new (class extends Base {
  async list(ctx) {
    const ret = this.t.initRet()
    const qFields = ['name', 'phone']

    ret.data = await usersMod.run(ctx, 'list', {}, { qFields })

    ctx.state.logger('debug', '列出用户')
    ctx.state.sendJSON(ret)
  }

  async get(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    ret.data = await usersMod.run(ctx, 'get', targetId)

    ctx.state.logger('debug', `获取用户：userId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async modify(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const nextData = ctx.request.body

    await usersMod.modify(ctx, targetId, nextData)

    if ([1, true, 'true'].includes(nextData.is_disabled)) {
      // 收回令牌
      const xAuthTokenCacheKey = await authCtrl.createAuthCacheKey(targetId, '*', 'web', '*', 'user')
      await ctx.state.redis.del(xAuthTokenCacheKey)
    }

    ctx.state.logger('debug', `修改用户：userId=${targetId}`, nextData)
    ctx.state.sendJSON(ret)
  }

  async delete(ctx) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId

    await usersMod.run(ctx, 'delete', targetId)

    ctx.state.logger('debug', `删除用户：userId=${targetId}`)
    ctx.state.sendJSON(ret)
  }
})()

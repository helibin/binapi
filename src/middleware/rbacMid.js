/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-20 15:57:20
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import { ef } from '../helper/casbinHelper'
import Mod from '../model'

module.exports = new (class extends Base {
  casbinCheck(resource, identifier) {
    return async (ctx, next) => {
      return await next()

      identifier = identifier || (ctx.state.user && ctx.state.user.id)
      resource = resource || ctx.url

      const isPass = await ctx.state.ef.enforce(identifier, resource)
      if (!isPass) {
        throw new this.ce('requestForbidden', 'noSuchPrivilege', {
          identifier,
          resource,
        })
      }

      await next()
    }
  }
})()

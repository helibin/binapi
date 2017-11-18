'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */
import * as usersMod from '../models/usersMod'



export const getUser = async (ctx) => {
  let opt = {
    id: ctx.params.targetId
  }
  let userInfo = await usersMod.getUser(ctx, opt);

  ctx.body = userInfo
}

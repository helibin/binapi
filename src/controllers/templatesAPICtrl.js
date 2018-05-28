'use strict'

/** 内建模块 */

/** 第三方模块 */
import CONFIG from 'config'

/** 基础模块 */
import * as t from '../base_modules/tools'

/** 项目模块 */
import templatesMod from '../models/templatesMod'



export const listTemplates = async(ctx) => {
  let ret = t.initRet()

  let opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit: ctx.state.pageSetting.pageSize,
  }

  try {
    let result = await templatesMod.findAndCountAll(opt)
    ret.data = result.rows

    ret.pageInfo = t.genPageInfo(ctx, result)
  } catch (e) {
    ret = e;
  }
  ctx.body = ret
}

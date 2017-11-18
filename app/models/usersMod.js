'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */
import * as DB from '../baseModules/dbInstance'



export const getUser = async(ctx, opt) => {
  let ret = t.initRet()

  ret.data = await DB.User.findOne({
    where: {
      id: opt.id
    }
  })
  return ret
}

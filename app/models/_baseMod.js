'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */
import * as DB from '../baseModules/dbInstance'


/**
 * 通用添加方法
 */
export const createAddDataFunc = async(ctx, model, data, callback) => {
  let ret = t.initRet()

  await DB[model].create(data)
  return ret
}

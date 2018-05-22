'use strict'

/** 内建模块 */
import bytes from 'bytes'

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../baseModules/tools'

/** 项目模块 */



export const index = async(ctx) => {
  await ctx.state.render('index', {
    body: 'index'
  })
}

'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import t from '../baseModules/tools'

/** 项目模块 */
import sqlTest from '../baseModules/mysqlHelper'

let index = async (ctx) => {
  await ctx.state.render('index', {body: 'xxx'})
  console.log(111, ',,,')
}

let testLogger = async (ctx) => {
  ctx.logger('trace', 'Entering cheese testing')
  ctx.logger('debug', 'Got cheese.')
  ctx.logger('info', 'Cheese is Gouda.')
  ctx.logger('warn', 'Cheese is quite smelly.')
  ctx.logger('error', 'Cheese is too ripe!')
  ctx.logger('fatal', 'Cheese was breeding ground for listeria.')
  await ctx.render('testLogger')
}

export default {
  index
  , testLogger
}

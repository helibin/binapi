'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import t from '../baseModules/tools'

/** 项目模块 */
import User from '../baseModules/db-init'

let index = async (ctx) => {
  // force: true will drop the table if it already exists
  // User.sync({force: false}).then(() => {
  //   // Table created
  //   return User.create({
  //     id: t.genUUID(),
  //     username: t.genRandStr(8),
  //   })
  // })
  await ctx.state.render('index', {body: 'xxx'})
}

let testLogger = async (ctx) => {
  ctx.state.logger('trace', 'Entering cheese testing')
  ctx.state.logger('debug', 'Got cheese.')
  ctx.state.logger('info', 'Cheese is Gouda.')
  ctx.state.logger('warn', 'Cheese is quite smelly.')
  ctx.state.logger('error', 'Cheese is too ripe!')
  ctx.state.logger('fatal', 'Cheese was breeding ground for listeria.')
  await ctx.render('test-logger')
}

let debugTest = async (ctx) => {
  ctx.state.logger('trace', 'Entering cheese testing')
  ctx.state.logger('debug', 'Got cheese.')
  ctx.state.logger('info', 'Cheese is Gouda.')
  ctx.state.logger('warn', 'Cheese is quite smelly.')
  ctx.state.logger('error', 'Cheese is too ripe!')
  ctx.state.logger('fatal', 'Cheese was breeding ground for listeria.')
  await ctx.render('debug-test.html')
}

export default {
  index,
  testLogger,
  debugTest,
}

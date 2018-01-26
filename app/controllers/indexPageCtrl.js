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

export const testLogger = async(ctx) => {
  ctx.state.logger('trace', 'Entering cheese testing')
  ctx.state.logger('debug', 'Got cheese.')
  ctx.state.logger('info', 'Cheese is Gouda.')
  ctx.state.logger('warn', 'Cheese is quite smelly.')
  ctx.state.logger('error', 'Cheese is too ripe!')
  ctx.state.logger('fatal', 'Cheese was breeding ground for listeria.')
  await ctx.render('test-logger')
}

export const debugTest = async(ctx) => {
  ctx.state.logger('trace', 'Entering cheese testing')
  ctx.state.logger('debug', 'Got cheese.')
  ctx.state.logger('info', 'Cheese is Gouda.')
  ctx.state.logger('warn', 'Cheese is quite smelly.')
  ctx.state.logger('error', 'Cheese is too ripe!')
  ctx.state.logger('fatal', 'Cheese was breeding ground for listeria.')
  await ctx.render('debug-test.html')
}

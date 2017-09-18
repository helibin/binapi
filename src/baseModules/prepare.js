'use strict'

/** 内建模块 */

/** 第三方模块 */
import colors from 'colors'

/** 基础模块 */
import CONFIG from 'config'
import t from './tools'
import {logger} from './logger'

/** 项目模块 */

const response = (ctx, next) => {
  let _clientId = ctx._clientId || t.genRandStr(24)

  // logger.error(ctx.cookies.get('_clientId'))

  ctx.cookies.set('_clientId', _clientId, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // cookie有效时长
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),  // cookie失效时间
    httpOnly: false,  // 是否只用于http请求中获取
    overwrite: true  // 是否允许重写
  })
  ctx.requestId = t.genUUID()
  // 包装日志函数，使日志中包含RequestId
  ctx.logger = function loggerWrap() {
    let args = Array.prototype.slice.call(arguments)
    let logLevel = args.shift()
    args.unshift(colors.yellow(`[ReqId: ${ctx.requestId}]`))

    if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)) {
      logLevel = logLevel ? 'error' : 'info'
    }

    logger[logLevel].apply(logger, args)
  }

  return next()
}

export default {
  response
}

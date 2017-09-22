'use strict'

/** 内建模块 */

/** 第三方模块 */
import colors from 'colors'

/** 基础模块 */
import CONFIG from 'config'
import t from './tools'
import logger from './logger'

/** 项目模块 */

const response = (ctx, next) => {
  let _clientId = ctx.cookies._clientId || t.genRandStr(24)
  ctx.state._clientId = _clientId
  // logger.error(ctx.cookies.get('_clientId'))

  ctx.cookies.set('_clientId', _clientId, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // cookie有效时长
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),  // cookie失效时间
    httpOnly: false,  // 是否只用于http请求中获取
    overwrite: true  // 是否允许重写
  })
  ctx.state.requestId = t.genUUID()
  // 包装日志函数，使日志中包含RequestId
  ctx.state.logger = function loggerWrap() {
    let args = Array.prototype.slice.call(arguments)
    let logLevel = args.shift()
    args.unshift(colors.yellow(`[ReqId: ${ctx.state.requestId}]`))

    if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)) {
      logLevel = logLevel ? 'error' : 'info'
    }

    logger[logLevel].apply(logger, args)
  }

  ctx.state.render = async(view, pageData) => {
    let renderData = {
      t          : t
      , path     : ctx.path
      , query    : ctx.query
      , params   : ctx.params
      , useragent: ctx.useragent
      , CONFIG   : CONFIG
      , pageData : pageData || {}
    }

    await ctx.render(view, renderData)
    ctx.state.logger(renderData.pageError, '渲染HTML页面')

    ctx.html += '<!-- requestId=' + ctx.state.requestId + ' -->';
  }

  return next()
}

export default {
  response
}

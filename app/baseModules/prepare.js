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
  let _requestId = t.genUUID()

  ctx.state._clientId  = _clientId
  ctx.state._requestId = _requestId
  // logger.error(ctx.cookies.get('_clientId'))

  ctx.cookies.set('_clientId', _clientId, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // cookie有效时长
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),  // cookie失效时间
    httpOnly: false,  // 是否只用于http请求中获取
    overwrite: true  // 是否允许重写
  })

  // 包装日志函数，使日志中包含RequestId
  ctx.state.logger = function loggerWrap() {
    let args = Array.prototype.slice.call(arguments)
    let logLevel = args.shift()
    args.unshift(colors.yellow(`[ReqId: ${_requestId}]`))

    if (!['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)) {
      logLevel = logLevel ? 'error' : 'info'
    }

    logger[logLevel].apply(logger, args)
  }
  // 包装重定向函数，自动打印日志并包含RequestId
  ctx.state.redirect = function redirect(nextUrl) {
    ctx.state.logger('debug', `重定向：nextUrl=${nextUrl}`)

    ctx.set('x-request-id', _requestId);
    ctx.redirect(nextUrl);
  }

  ctx.state.render = async(view, pageData) => {
    let renderData = {
      t           : t,
      CONFIG      : CONFIG,
      path        : ctx.path,
      query       : ctx.query,
      params      : ctx.params,
      userAgent   : ctx.userAgent,
      xResposeTime: ctx.state.xResposeTime,
      pageData    : pageData || {},
    }

    await ctx.render(view, renderData)
    ctx.state.logger(renderData.pageError, '渲染HTML页面')

    ctx.body += '<!-- requestId=' + _requestId + ' -->';
  }

  // 打印请求
  ctx.state.logger('debug', `收到请求：${JSON.stringify({
    ip      : ctx.ip,
    referer : ctx.get('referer') || undefined,
    host    : ctx.host,
    browser : ctx.userAgent.browser,
    version : ctx.userAgent.version,
    os      : ctx.userAgent.os,
    platform: ctx.userAgent.platform,
    method  : ctx.method,
    url     : ctx.originalUrl,
    query   : ctx.query,
    body    : ctx.body || undefined,
  })}`)

  return next()
}

export default {
  response
}

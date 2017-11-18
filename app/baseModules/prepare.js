'use strict'

/** 内建模块 */
import bytes from 'bytes'

/** 第三方模块 */
import colors from 'colors/safe'

/** 基础模块 */
import CONFIG from 'config'
import * as t from './tools'

/** 项目模块 */
import logger from './logger'

const response = async (ctx, next) => {
  ctx.state.startTime = Date.now()

  let _clientId  = ctx.cookies._clientId || t.genRandStr(24)
  let _requestId = t.genUUID()

  ctx.state._clientId  = _clientId
  ctx.state._requestId = _requestId

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

    ctx.set('x-request-id', ctx.state._requestId)
    ctx.redirect(nextUrl);
  }

  // 渲染页面
  ctx.state.render = async(view, pageData) => {
    let renderData = {
      t        : t,
      CONFIG   : CONFIG,
      path     : ctx.path,
      query    : ctx.query,
      params   : ctx.params,
      userAgent: ctx.userAgent,
      time     : Date.now() - ctx.state.startTime,
      pageData : pageData || {},
    }

    await ctx.render(view, renderData)
    ctx.state.logger(renderData.pageError, '渲染HTML页面')

    ctx.body += '<!-- requestId=' + _requestId + ' -->';
  }

  // 包装数据发送函数，自动打印日志并包含RequestId
  ctx.state.sendJSON = (data) => {
    data.requestId = ctx.state._requestId

    ctx.type('json')
    ctx.send(data)
  }

  await next()

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
    type    : ctx.type,
    time    : `${Date.now() - ctx.state.startTime}ms`,
    size    : bytes(ctx.length) ? bytes(ctx.length).toLowerCase() : undefined,
  })}`)
}

export default {
  response
}

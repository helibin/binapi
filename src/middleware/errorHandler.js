/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 10:15:38
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { T as t, ce } from '../helper'

/** 项目模块 */

module.exports = async (ctx, next) => {
  let ret = t.initRet()
  try {
    ctx.state.hasError = false

    await next()
    // 404
    if (ctx.status === 404 && !ctx.body) {
      if (ctx.state.accepts === 'html') {
        ctx.type = 'html'
        await ctx.state.render('404', { title: 'o(╥﹏╥)o 404' })
      } else {
        ctx.type = 'json'
        throw new ce('noSuchRouter', null, {
          method: ctx.method,
          host: ctx.host,
          url: ctx.url,
        })
      }
    }
  } catch (ex) {
    ctx.state.hasError = true

    // 自定义异常处理
    if (ex instanceof ce) {
      if (ctx.state.accepts === 'json') {
        ctx.state.logger('error', '自定义异常：\n', ex.toJSON())
        return ctx.state.sendJSON(ex)
      }

      const pageData = { title: 'err-biz', err: ctx.state.i18n(ex.toJSON()) }
      return await ctx.state.render(pageData.err.status === 401 ? 'sign-in' : 'err-biz', pageData)
    }

    if (ex instanceof Error) {
      // 程序异常
      if (['prod', 'qa'].includes(process.env.NODE_ENV)) ctx.state.rLog(ex)

      ctx.state.logger('error', '系统异常：')
      const stackLines = ex.stack.split('\n')
      for (const stackLine of stackLines) {
        ctx.state.logger(ex, stackLine)
      }
    }

    if (ctx.state.accepts === 'json') {
      if (['prod', 'qa'].includes(process.env.NODE_ENV)) {
        const exWrap = new ce('eWebServer', 'unexpectedError')
        return ctx.state.sendJSON(exWrap)
      }

      ret = new ce('eWebServer', ex.message || ex.toString())
      return ctx.state.sendJSON(ret)
    }

    const pageData = { title: 'err-sys', err: { req_id: ctx.state.reqId } }
    return await ctx.state.render('err-sys', pageData)
  }
}

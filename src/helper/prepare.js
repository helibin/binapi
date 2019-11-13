/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 10:17:49
 */
/** 内建模块 */

/** 第三方模块 */
import bytes from 'bytes'
import chalk from 'chalk'

/** 基础模块 */
import CONFIG from 'config'
import { CONST } from './yamlCC'
import Redis from './redisHelper'
import AlyMns from './alyMnsHelper'
import AlyOss from './alyOssHelper'
import AlyPop from './alyPopHelper'
import AlySms from './alySmsHelper'
import Axios from './axiosHelper'
import NodeMailer from './nodeMailerHelper'
import SubMailer from './subMailerHelper'
import Wxpay from './wxpayHelper'

import Log from './logger'

import ce from './customError'
import t from './toolkit'

/** 项目模块 */
import i18n from '../i18n'
import pkg from '../../package'

exports.response = async (ctx, next) => {
  try {
    const reqId = t.genUUID()
    const locale = ctx.headers['x-locale'] || CONFIG.webServer.defaultLocale

    ctx.state.reqId = reqId
    ctx.state.locale = locale
    ctx.state.shortLocale = locale.split('-')[0]
    ctx.state.accepts = ctx.accepts(['json', 'html'])
    ctx.state.clientIp =
      (ctx.headers['x-real-ip'] || '').split(',')[0] || (ctx.headers['x-forwarded-for'] || '').split(',')[0] || ctx.ip
    ctx.state.clientType = t.isMobile(ctx.userAgent) ? 'mobile' : 'desktop'
    ctx.state.clientId = t.getMd5(ctx.state.clientType + ctx.userAgent.source + ctx.state.clientIp)

    // 包装日志函数, 使日志中包含reqId
    ctx.state.logger = (...args) => {
      const logLevel = args.shift()
      args.unshift(chalk.yellow(`[ReqId: ${reqId}]`))

      Log.logger(logLevel, ctx.method, ...args)
    }

    ctx.state.rLog = Log.rLog

    // 包装重定向函数, 自动打印日志并包含reqId
    ctx.state.redirect = nextUrl => {
      ctx.state.logger('debug', `重定向：nextUrl=${nextUrl}`)

      ctx.set('x-req-id', ctx.state.reqId)
      ctx.redirect(nextUrl)
    }

    // 渲染页面
    ctx.state.render = async (view, pageData) => {
      const renderData = {
        t,
        CONFIG,
        path: ctx.path,
        query: ctx.query,
        params: ctx.params,
        userAgent: ctx.userAgent,
        pageData: pageData || {},
        pkg,
      }

      await ctx.render(view, renderData)
      ctx.state.logger(renderData.pageError, '渲染HTML页面')

      ctx.body += `<!-- reqId=${reqId} -->`
    }

    // 包装媒体发送函数
    ctx.state.sendMedia = (media, mime = 'mp4') => {
      ctx.state.logger('debug', `发送文件：长度：${media.length}；MIME类型：${mime}, 名称：${'<文件流>'}`)
      const mimeType = Object.assign(
        {},
        CONST.mimeType.audio,
        CONST.mimeType.image,
        CONST.mimeType.video,
        CONST.mimeType.text,
      )

      ctx.accepts(mimeType[mime])
      ctx.type = mimeType[mime]

      ctx.body = media
    }

    // 包装文件发送函数, 自动打印日志, 但不包含reqId
    ctx.state.sendFile = (f, fileName) => {
      ctx.state.logger('debug', `发送文件：长度：${f.length}；名称：${fileName || '<文件流>'}`)

      if (fileName) {
        ctx.attachment(fileName)
      }

      ctx.body = f
    }

    // 国际化
    ctx.state.i18n = (data = {}) => {
      data.msg = i18n[ctx.state.shortLocale].resMsg[data.msg] || data.msg

      data.ts = data.ts || Date.now()
      data.req_id = data.req_id || ctx.state.reqId

      return data
    }

    // 包装数据发送函数, 自动打印日志并包含reqId
    ctx.state.sendJSON = (data = t.initRet()) => {
      if (data instanceof ce) {
        data = data.toJSON()
      } else if (ctx.state.isCacheRes) {
        data.msg = 'okFromCache'
      }

      data.page_info = ctx.state.pageInfo
      data = ctx.state.i18n(data)
      data.ts = Date.now()
      data.req_id = ctx.state.reqId

      ctx.accepts('json')
      ctx.body = data
    }

    ctx.state.sendXML = async json => {
      const data = await t.buildXML(json)

      ctx.body = data
    }

    // alyMns初始化
    ctx.state.alyMns = new AlyMns(ctx)
    // alyOss初始化
    ctx.state.alyOss = new AlyOss(ctx)
    // alyPop初始化
    ctx.state.alyPop = new AlyPop(ctx)
    // alySms初始化
    ctx.state.alySms = new AlySms(ctx)
    // axios初始化
    ctx.state.axios = new Axios(ctx)
    // nodeMailer初始化
    ctx.state.nodeMailer = new NodeMailer(ctx)
    // subMailer初始化
    ctx.state.subMailer = new SubMailer(ctx)
    // redis初始化
    ctx.state.redis = new Redis(ctx)
    // wxPay初始化
    ctx.state.wxpay = new Wxpay(ctx)

    // 格式化xml数据
    if (ctx.request.type && ctx.request.type.includes('xml')) {
      ctx.request.xml = await exports.parseXMLFromReq(ctx.req)
    }

    ctx.state.logger(ctx.state.hasError, chalk.blueBright('收到客户端数据 >>>\n'), {
      host: ctx.host || null,
      ip: ctx.state.clientIp || null,
      type: ctx.type || ctx.headers['content-type'] || null,
      url: ctx.originalUrl || null,
      browser: ctx.userAgent.browser || null,
      version: ctx.userAgent.version || null,
      os: ctx.userAgent.os || null,
      platform: ctx.userAgent.platform || null,
      clientType: ctx.state.clientType || null,
      clientIdStr: ctx.state.clientType + ctx.userAgent.source + ctx.state.clientIp,
      clientId: ctx.state.clientId || null,
      referer: ctx.get('referer') || null,
      headers: { ...ctx.headers, cookie: undefined } || null,
      query: t.jsonStringify(ctx.query || null),
      post: t.jsonStringify(ctx.request.body || null),
      file: t.jsonStringify((ctx.request.files && ctx.request.files.file) || null),
      xml: t.jsonStringify(ctx.request.xml || null),
    })

    await next()
  } catch (ex) {
    if (ex instanceof ce) {
      ctx.state.hasError = true
    } else {
      Log.logger('debug', '发生异常：', ex)
    }

    throw ex
  } finally {
    // 请求结束并打印响应数据
    const xResponseTime = Date.now() - ctx.state.startTime
    ctx.set('x-response-time', xResponseTime)

    // 响应数据处理
    let resData =
      ctx.body && ctx.body.req_id
        ? t.jsonStringify({
            ...ctx.body,
            data: ['prod', 'qa'].includes(process.env.NODE_ENV) ? ctx.body.data : undefined,
          })
        : ctx.body
    resData = Buffer.isBuffer(resData) ? '<Buffer ...></Buffer>' : resData
    resData = t.isStream(resData) ? '<Stream ...></Stream>' : resData

    ctx.state.logger(
      ctx.state.hasError,
      chalk.blueBright('响应客户端数据 >>>\n'),
      t.jsonFormat({
        type: ctx.type,
        time: `${xResponseTime}ms` || null,
        size: bytes(ctx.length) ? bytes(ctx.length).toLowerCase() : null,
        resData,
      }),
    )
  }
}

/**
 * 判断客户端请求的分页信息, 并保存到`ctx.state.pageSetting`
 * @param {object} ctx ctx
 * @param {object} next next
 */
exports.handlePageSetting = async (ctx, next) => {
  ctx.state.paging = ctx.query.paging === undefined ? CONFIG.webServer.defaultPaging : ctx.query.paging
  ctx.state.paging = t.toBoolean(ctx.state.paging)

  let page = parseInt(ctx.query.page, 10) || 1
  if (page < 1) page = 1

  let psize = parseInt(ctx.query.psize, 10) || CONFIG.webServer.psize
  if (psize < 1) {
    psize = CONFIG.webServer.psize
  }
  if (psize > CONFIG.webServer.psizeMax) {
    psize = CONFIG.webServer.psizeMax
  }

  ctx.state.pageSetting = {
    pageStart: psize * (page - 1),
    page,
    psize,
  }

  await next()
}

// 解析XML参数
exports.parseXMLFromReq = async req =>
  new Promise((resolve, reject) => {
    let data = ''

    req.on('data', chunk => {
      data += chunk
    })

    req.on('end', async () => {
      data = await t.parseXML(data).catch(ex => reject(ex))

      resolve(data)
    })
  })

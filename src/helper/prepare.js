/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-15 12:17:43
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk';
import bytes from 'bytes';

/** 基础模块 */
import CONFIG           from 'config';
import Redis            from './redisHelper';
import AlyHelper        from './alyHelper';
import AlySMS           from './alySMSHelper';
import Axios            from './axiosHelper';
import NodeMailer       from './nodeMailerHelper';
import SubMailer        from './subMailerHelper';

import { logger, rLog } from './logger';

import _e               from './customError';
import t                from './tools';

/** 项目模块 */
import i18n from '../i18n';
import pkg from '../../package';


const Prepare = {};

Prepare.response = async (ctx, next) => {
  try {
    const clientId  = ctx.cookies.get('_clientId') || t.genRandStr(24);
    const requestId = t.genUUID();
    const locale    = ctx.cookies.get('_locale') || CONFIG.webServer.defaultLocale;

    ctx.state.clientId    = clientId;
    ctx.state.requestId   = requestId;
    ctx.state.locale      = locale;
    ctx.state.shortLocale = locale.split('-')[0];
    ctx.state.accepts     = ctx.url.startsWith(CONFIG.apiServer.prefix)
      ? 'json' : ctx.accepts('json', 'html');
    ctx.state.clientIP    = (ctx.headers['x-real-ip'] || '').split(',')[0]
    || (ctx.headers['x-forwarded-for'] || '').split(',')[0]
    || ctx.ip;

    ctx.cookies.set('_clientId', clientId, {
      maxAge   : 365 * 24 * 60 * 60 * 1000, // cookie有效时长
      expires  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // cookie失效时间
      httpOnly : true, // 是否只用于http请求中获取
      overwrite: false, // 是否允许重写
    });

    // 包装日志函数，使日志中包含RequestId
    ctx.state.logger = (...args) => {
      const logLevel = args.shift();
      args.unshift(chalk.yellow(`[ReqId: ${requestId}]`));

      logger(logLevel, ...args);
    };

    ctx.state.rLog = rLog;

    // 包装重定向函数，自动打印日志并包含RequestId
    ctx.state.redirect = (nextUrl) => {
      ctx.state.logger('debug', `重定向：nextUrl=${nextUrl}`);

      ctx.set('x-request-id', ctx.state.requestId);
      ctx.redirect(nextUrl);
    };

    // 渲染页面
    ctx.state.render = async (view, pageData) => {
      const renderData = {
        t,
        CONFIG,
        path     : ctx.path,
        query    : ctx.query,
        params   : ctx.params,
        userAgent: ctx.userAgent,
        pageData : pageData || {},
        pkg,
      };

      await ctx.render(view, renderData);
      ctx.state.logger(renderData.pageError, '渲染HTML页面');

      ctx.body += `<!-- requestId=${requestId} -->`;
    };

    // 包装SVG发送函数
    ctx.state.sendSVG = (svg) => {
      ctx.accepts('svg');
      ctx.body = svg;
    };

    // 包装数据发送函数，自动打印日志并包含RequestId
    ctx.state.sendJSON = (data = {}) => {
      if (data instanceof _e) data = data.toJSON();
      data.requestId = ctx.state.requestId;
      data = ctx.state.i18n(data);

      ctx.accepts('json');
      ctx.body = data;
    };

    // 国际化
    ctx.state.i18n = (data = {}) => {
      data.msg = i18n[ctx.state.shortLocale].resMsg[data.msg] || data.msg;
      return data;
    };

    // alyHelper初始化
    ctx.state.aly        = new AlyHelper(ctx);
    // redis初始化
    ctx.state.redis      = new Redis(ctx);
    // alySMS初始化
    ctx.state.alySMS     = new AlySMS(ctx);
    // nodeMailer初始化
    ctx.state.nodeMailer = new NodeMailer(ctx);
    // submail初始化
    ctx.state.subMailer  = new SubMailer(ctx);
    // axios初始化
    ctx.state.axios      = new Axios(ctx);

    await next();
  } catch (ex) {
    if (ex instanceof _e) {
      ctx.state.requestError = true;
    }

    throw ex;
  } finally {
    // 请求结束并打印响应数据
    const xResponseTime = Date.now() - ctx.state.startTime;

    ctx.set('x-response-time', xResponseTime);
    ctx.state.logger(ctx.state.requestError, `响应数据：${JSON.stringify({
      ip      : ctx.state.clientIP,
      location: await t.getLocationByIP(ctx.state.clientIP),
      referer : ctx.get('referer') || undefined,
      host    : ctx.host,
      browser : ctx.userAgent.browser,
      version : ctx.userAgent.version,
      os      : ctx.userAgent.os,
      platform: ctx.userAgent.platform,
      method  : ctx.method,
      url     : ctx.originalUrl,
      query   : ctx.query,
      post    : ctx.request.body,
      type    : ctx.type,
      time    : xResponseTime,
      size    : bytes(ctx.length) ? bytes(ctx.length).toLowerCase() : undefined,
    })}`);
  }
};

Prepare.xAuthToken = async (ctx, next) => {
  // 从HTTP header中获取
  if (CONFIG.webServer.xAuthHeader
    && ctx.headers[CONFIG.webServer.xAuthHeader]) {
    ctx.state.xAuthToken = ctx.headers[CONFIG.webServer.xAuthHeader];
  } else

  // 从Query String中获取
  if (CONFIG.webServer.xAuthQuery
    && ctx.query[CONFIG.webServer.xAuthQuery]) {
    ctx.state.xAuthToken = ctx.query[CONFIG.webServer.xAuthQuery];
  } else

  // 从Cookie中获取
  if (CONFIG.webServer.xAuthCookie
    && ctx.cookies.get(CONFIG.webServer.xAuthCookie)) {
    ctx.state.xAuthToken = ctx.cookies.get(CONFIG.webServer.xAuthCookie);
  }

  await next();
};

/**
 * 判断客户端请求的分页信息，并保存到`ctx.state.pageSetting`
 * @param {object} ctx ctx
 * @param {object} next next
 * @returns {none} none
 */
Prepare.detectPageSetting = async (ctx, next) => {
  let page = parseInt(ctx.request.query.page, 10) || 1;
  let pageSize = parseInt(ctx.request.query.per_page, 10) || CONFIG.webServer.pageSize;

  if (page < 0) page = 1;
  if (pageSize < 0) pageSize = CONFIG.webServer.pageSize;
  if (pageSize > CONFIG.webServer.pageSizeMax) pageSize = CONFIG.webServer.pageSizeMax;

  ctx.state.pageSetting = {
    pageStart: pageSize * (page - 1),
    page,
    pageSize,
  };

  return await next();
};

export default Prepare;

/** 内建模块 */
import bytes from 'bytes';

/** 第三方模块 */
import colors from 'colors';

/** 基础模块 */
import CONFIG from 'config';
import t from './tools';

/** 项目模块 */
import logger from './logger';

const Prepare = {};
Prepare.response = async (ctx, next) => {
  try {
    ctx.state.startTime = Date.now();

    const clientId = ctx.cookies.get('_clientId') || t.genRandStr(24);
    const requestId = t.genUUID();
    const locale = ctx.cookies.get('_locale') || 'zh-CN';
    global.ctxData = { test: 'ctxData', ta: 233 };

    ctx.state.clientId = clientId;
    ctx.state.requestId = requestId;
    ctx.state.locale = locale;

    ctx.cookies.set('_clientId', clientId, {
      maxAge   : 365 * 24 * 60 * 60 * 1000, // cookie有效时长
      expires  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // cookie失效时间
      httpOnly : true, // 是否只用于http请求中获取
      overwrite: false, // 是否允许重写
    });

    // 包装日志函数，使日志中包含RequestId
    ctx.state.logger = (...args) => {
      const logLevel = args.shift();
      args.unshift(colors.yellow(`[ReqId: ${requestId}]`));

      logger(logLevel, ...args);
    };

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
        time     : Date.now() - ctx.state.startTime,
        pageData : pageData || {},
      };

      await ctx.render(view, renderData);
      ctx.state.logger(renderData.pageError, '渲染HTML页面');

      ctx.body += `<!-- requestId=${requestId} -->`;
    };

    // 包装数据发送函数，自动打印日志并包含RequestId
    ctx.state.sendJSON = (data) => {
      data.requestId = ctx.state.requestId;

      ctx.accepts('json');
      ctx.body = data;
    };

    await next();
  } catch (e) {
    ctx.state.requestError = true;

    // 自定义错误处理
    ctx.status = e.status || 500;
    ctx.body = e.body || e.message;
    ctx.state.logger(e, ctx.url);
    ctx.state.logger(e, `${e.stack}`);
  } finally {
  // 打印请求
    ctx.state.logger(ctx.state.requestError, `响应请求：${JSON.stringify({
      ip      : ctx.ip,
      location: JSON.stringify(await t.getLocationByIP(ctx.ip)),
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
    })}`);
  }
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

  return next();
};

export default Prepare;

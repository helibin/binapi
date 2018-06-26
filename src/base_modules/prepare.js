/** 内建模块 */
import bytes from 'bytes';

/** 第三方模块 */
import colors from 'colors/safe';

/** 基础模块 */
import CONFIG from 'config';
import t from './tools';

/** 项目模块 */
import logger from './logger';

const Prepare = {};
Prepare.response = async (ctx, next) => {
  ctx.state.startTime = Date.now();

  const clientId = ctx.cookies.get('_clientId') || t.genRandStr(24);
  const requestId = t.genUUID();
  const locale = ctx.cookies.get('_locale') || 'zh-CN';
  global.ctxData = { test: 'ctxData', ta: 233 };

  ctx.state.clientId = clientId;
  ctx.state.requestId = requestId;
  ctx.state.locale = locale;

  ctx.cookies.set('_clientId', clientId, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // cookie有效时长
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // cookie失效时间
    httpOnly: true, // 是否只用于http请求中获取
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
      path: ctx.path,
      query: ctx.query,
      params: ctx.params,
      userAgent: ctx.userAgent,
      time: Date.now() - ctx.state.startTime,
      pageData: pageData || {},
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

  // 打印请求
  ctx.state.logger('debug', `响应请求：${JSON.stringify({
    ip: ctx.ip,
    location: JSON.stringify(await t.getLocationByIP(ctx)),
    referer: ctx.get('referer') || undefined,
    host: ctx.host,
    browser: ctx.userAgent.browser,
    version: ctx.userAgent.version,
    os: ctx.userAgent.os,
    platform: ctx.userAgent.platform,
    method: ctx.method,
    url: ctx.originalUrl,
    query: ctx.query,
    type: ctx.type,
    time: `${Date.now() - ctx.state.startTime}ms`,
    size: bytes(ctx.length) ? bytes(ctx.length).toLowerCase() : undefined,
  })}`);
};

/**
[中间件] 判断客户端请求的分页信息，并保存到`ctx.state.pageSetting`
详细内容如下：{
  "pageStart" : <记录开始位置>,
  "pageSize"  : <分页大小>,
  "pageNumber": <页号（从1开始）>
}
*/
Prepare.detectPageSetting = async (ctx, next) => {
  let pageNumber = parseInt(ctx.request.query.pageNumber, 10) || 1;
  let pageSize = parseInt(ctx.request.query.pageSize, 10) || CONFIG.webServer.pageSize;

  if (pageNumber < 0) pageNumber = 1;
  if (pageSize < 0) pageSize = CONFIG.webServer.pageSize;
  if (pageSize > CONFIG.webServer.pageSizeMax) pageSize = CONFIG.webServer.pageSizeMax;

  ctx.state.pageSetting = {
    pageStart: pageSize * (pageNumber - 1),
    pageNumber,
    pageSize,
  };

  return next();
};

export default Prepare;

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from './tools';

/** 项目模块 */


export default async (ctx, next) => {
  try {
    // 请求计时开始
    ctx.state.startTime = Date.now();

    await next();
    // 404
    if (ctx.status === 404) {
      switch (ctx.accepts('json', 'html')) {
        case 'html':
          ctx.type = 'html';
          await ctx.state.render('404');
          break;
        case 'json':
          ctx.body = t.initRet(404, 'Not Found');
          break;
        default:
          ctx.type = 'text';
          ctx.body = 'Page Not Found';
      }
    }
  } catch (e) {
    // 自定义错误处理
    ctx.status = e.status || 500;
    if (e.name === 'myError') {
      ctx.body = {
        err : e.respCode,
        msg : e.respMessage,
        data: e.respData,
      };
    } else {
      ctx.state.logger('e', ctx.url, e);
      ctx.body = e.body || e.message;
    }
  }
};

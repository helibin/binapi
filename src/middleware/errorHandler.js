/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 11:32:59
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, _e, t,
} from '../helper';

/** 项目模块 */


export default async (ctx, next) => {
  let ret = t.initRet();
  try {
    // 请求计时开始
    ctx.state.startTime = Date.now();
    ctx.state.hasError = false;

    await next();
    // 404
    if (ctx.status === 404 && !ctx.body) {
      switch (ctx.state.accepts) {
        case 'html':
          ctx.type = 'html';
          await ctx.state.render('404', { title: 'o(╥﹏╥)o 404' });
          break;
        case 'json':
          ret = t.initRet('4010', 'Oops! Router Not Found.', {
            method: ctx.method,
            url   : ctx.url,
          });
          ctx.state.sendJSON(ret);
          break;
        default:
          ctx.type = 'text';
          ctx.body = 'Oops! Nothing Found.';
      }
    }
  } catch (ex) {
    ctx.state.logger(ex, `访问发生异常：${ex.name === 'MyError'
      ? `自定义异常 => ${JSON.stringify(ctx.state.i18n(ex.toJSON()))}`
      : '系统异常 =>'}`);

    ctx.status = ex.status || 500;
    if (ex.name === 'MyError') { // 自定义异常处理
      if (ctx.state.accepts === 'json') {
        return ctx.state.sendJSON(ex);
      }

      const pageData = { title: 'err-sys', err: ctx.state.i18n(ex.toJSON()) };
      await ctx.state.render('err-sys',  pageData);
    } else { // 程序异常
      if (CONFIG.env === 'production') ctx.state.rLog(ex);

      const stackLines = ex.stack.split('\n');
      for (const stackLine of stackLines) {
        ctx.state.logger(ex, stackLine);
      }

      if (ctx.state.accepts === 'json') {
        if (CONFIG.env === 'production') {
          const exWrap = new _e('EWebServer', 'unexpectedError');
          return ctx.state.sendJSON(exWrap);
        }
        ret = t.initRet(ex.name, ex.message);
        return ctx.state.sendJSON(ret);
      }

      const pageData = { title: 'err-sys', err: ex.message };
      await ctx.state.render('err-sys',  pageData);
    }
  }
};

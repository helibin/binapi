/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, _e, t,
} from '../helpers';

/** 项目模块 */


export default async (ctx, next) => {
  let ret = t.initRet();
  try {
    // 请求计时开始
    ctx.state.startTime = Date.now();

    await next();
    // 404
    if (ctx.status === 404 && !ctx.body) {
      switch (ctx.state.accepts) {
        case 'html':
          ctx.type = 'html';
          await ctx.state.render('404', { title: '404 Not Found' });
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
  } catch (err) {
    ctx.status = err.status || 500;
    if (err.name === '_myError') { // 自定义异常处理
      if (ctx.state.accepts === 'json') {
        return ctx.state.sendJSON(err);
      }
    } else { // 程序异常
      const stackLines = err.stack.split('\n');
      for (const stackLine of stackLines) {
        ctx.state.logger(err, stackLine);
      }

      if (ctx.state.accepts === 'json') {
        if (CONFIG.env === 'production') {
          const errWrap = new _e('EWebServer', 'unexpectedError');
          return ctx.state.sendJSON(errWrap);
        }
        ret = t.initRet(err.name, err.message);
        ctx.state.sendJSON(ret);
        return;
      }
    }
    const pageData = { title: 'err-sys' };
    await ctx.state.render('err-sys', CONFIG.env === 'production' ? pageData : pageData.err = err);
  }
};

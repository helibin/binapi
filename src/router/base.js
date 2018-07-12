/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import { ipMid } from '../middleware';


const router = new Router({ prefix: CONFIG.apiServer.prefix });
const pageRouter = new Router();

// index
router.get('/',

  (ctx) => {
    ctx.body = 'Hello BinAPI!';
  });

// env
router.get('/env', (ctx) => {
  ctx.state.logger('debug', process.env.NODE_ENV);
  ctx.body = process.env.NODE_ENV;
});

// fix preload
router.get('/check-node',
  ipMid.allowAccess(),
  (ctx) => {
    ctx.body = 'success';
  });

router.get('/ua', (ctx) => {
  ctx.body = {
    browser : ctx.userAgent.browser,
    version : ctx.userAgent.version,
    os      : ctx.userAgent.os,
    platform: ctx.userAgent.platform,
    ua      : ctx.userAgent,
  };
});

export default router;
export { router,  pageRouter };

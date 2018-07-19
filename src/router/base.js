/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-18 22:34:25
 */
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


/**
 * @apiDefine commonSuccessRes
 *
 * @apiSuccess {String} err 错误代码.
 * @apiSuccess {String} msg  错误消息.
 * @apiSuccess {Object} [data]  额外数据.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "err": 0,
 *        "msg": "OK",
 *        "msg_locale": "成功",
 *        "data": data,
 *        "requestId": "reqesutId"
 *      }
 */

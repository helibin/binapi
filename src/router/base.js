/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-10-15 12:00:32
 */
/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import { ipMid } from '../middleware';

/** 预处理 */
const router = new Router({ prefix: CONFIG.apiServer.prefix });
const pageRouter = new Router();

// index
router.all('/',

  (ctx) => {
    ctx.body = 'Hello World!';
  });

// env
router.all('/env', (ctx) => {
  ctx.state.logger('debug', process.env.NODE_ENV);
  ctx.body = process.env.NODE_ENV;
});

// fix preload
router.all('/check-node',
  ipMid.allowAccess(),
  (ctx) => {
    ctx.body = {
      server   : CONFIG.site.baseURL,
      timestamp: Date.now(),
    };
  });

router.all('/ua', (ctx) => {
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
 * @apiSuccess {string} err 错误代码
 * @apiSuccess {string} msg  错误消息
 * @apiSuccess {object} [data]  额外数据
 * @apiSuccess {string} request_id  请求ID
 *
 * @apiSuccessExample {json} Common-Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "err": 0,
 *        "msg": "OK",
 *        "data": data,
 *        "request_id": "request_id"
 *      }
 */

/**
  * @apiDefine commonErrorRes
  *
  * @apiError {string} err 错误代码
  * @apiError {string} msg  错误消息
  * @apiError {object} [data]  额外数据
  * @apiError {string} request_id  请求ID
  * @apiError {string} invalidAuthToken 无效认证令牌
  * @apiError {string} userNotSignedIn 用户未登录
  *
  * @apiErrorExample {json} Common-Error-Response:
  *     HTTP/1.1 400 Bad Request
  *     {
  *        "err": 4030,
  *        "msg": "无效认证令牌",
  *        "data": {
  *           "x_auth_token": "x_auth_token"
  *        }
  *        "request_id": "request_id"
  *     }
  *
  *     HTTP/1.1 401 Unauthorized
  *     {
  *        "err": 1010,
  *        "msg": "用户未登录",
  *        "request_id": "request_id"
  *     }
  */

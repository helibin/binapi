/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-18 19:52:14
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router  } from './base';

/** 项目模块 */
import { authAPICtrl  } from '../controller';
import { ipMid, paramMid } from '../middleware';
import { authLogic } from '../logic';

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

/**
 * @api {post} /auth/sign-in 用户登录
 * @apiVersion 0.1.0
 * @apiDescription 用户登录接口
 * @apiName signIn
 * @apiGroup Auth
 *
 * @apiPermission admin
 *
 * @apiHeader [x-auth-token] 令牌
 *
 * @apiParam {String} identifier 用户名.
 * @apiParam {String} password密码(md5值).
 *
 *
 * @apiUse commonSuccessRes
 *
 * @apiError noSuchUser 用户不存在
 * @apiError userIsExisted 用户存在
 * @apiError invildUsenameOrPassowrd 用户名或密码错误
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *        "err": 1000,
 *        "msg": "noSuchUser",
 *        "msg_locale": "用户不存在",
 *        "requestId": "reqesutId"
 *     }
 *
 *     HTTP/1.1 401 Unauthorized
 *     {
 *        "err": 1060,
 *        "msg": "invildUsenameOrPassowrd",
 *        "msg_locale": "用户名或密码错误",
 *        "requestId": "reqesutId"
 *     }
 *
 * @apiSampleRequest /auth/sign-in
 */
router.post('/auth/sign-in',
  paramMid.check(authLogic.signIn),
  authAPICtrl.run('signIn'));

router.post('/auth/sign-up',
  ipMid.allowAccess(),
  paramMid.check(authLogic.signUp),
  authAPICtrl.run('signUp'));

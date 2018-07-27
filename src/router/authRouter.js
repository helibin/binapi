/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 14:47:07
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router  } from './base';

/** 项目模块 */
import { authCtrl  } from '../controller';
import {
  bizMid, ipMid, paramMid,
} from '../middleware';
import { authLogic } from '../logic';


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
  paramMid.run('joiCheck', authLogic.signIn),
  authCtrl.run('signIn'));

/**
 * @api {post} /auth/sign-up 用户注册
 * @apiVersion 0.1.0
 * @apiDescription 用户注册接口
 * @apiName signUp
 * @apiGroup Auth
 *
 * @apiParam {String} identifier 用户名.
 * @apiParam {String} password密码(md5值).
 * @apiParam {String} [nickname].
 * @apiParam {String} name.
 * @apiParam {String} [mobile].
 * @apiParam {String} [email].
 *
 *
 * @apiUse commonSuccessRes
 *
 * @apiError userIsExisted 用户已存在
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *        "err": 1000,
 *        "msg": "userIsExisted",
 *        "msg_locale": "用户已存在",
 *        "requestId": "reqesutId"
 *     }
 *
 * @apiSampleRequest /auth/sign-up
 */
router.post('/auth/sign-up',
  ipMid.run('allowAccess'),
  paramMid.run('joiCheck', authLogic.signUp),
  bizMid.run('userNotExists', 'request.body.identifier'),
  authCtrl.run('signUp'));

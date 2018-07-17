// /** 内建模块 */

// /** 第三方模块 */

// /** 基础模块 */
import { router  } from './base';

// /** 项目模块 */
import { authAPICtrl  } from '../controller';
import { ipMid, paramMid } from '../middleware';
import { authLgc  } from '../logic';


/**
 * @api {get} /auth/sign-in 用户登录
 * @apiName signIn
 * @apiGroup Auth
 *
 * @apiParam {String} identifier 用户名.
 * @apiParam {String} password密码(md5值).
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
 *        "msg_locale": "OK",
 *        "data": userInfo,
 *        "requestId": "reqesutId"
 *     }
 *
 * @apiError noSuchUser 用户不存在
 * @apiError userIsExisted 用户存在
 * @apiError invildUsenameOrPassowrd 用户名或密码错误
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 用户不存在
 *     {
 *        "err": 1000,
 *        "msg": "noSuchUser",
 *        "msg_locale": "用户不存在",
 *        "requestId": "reqesutId"
 *     }
 *
 *     HTTP/1.1 401 未认证
 *     {
 *        "err": 1060,
 *        "msg": "invildUsenameOrPassowrd",
 *        "msg_locale": "用户名或密码错误",
 *        "requestId": "reqesutId"
 *     }
 */
router.post('/auth/sign-in',
  paramMid.check(authLgc.signIn),
  authAPICtrl.run('signIn'));

router.post('/auth/sign-up',
  ipMid.allowAccess(),
  paramMid.check(authLgc.signUp),
  authAPICtrl.run('signUp'));

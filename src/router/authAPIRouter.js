// /** 内建模块 */

// /** 第三方模块 */

// /** 基础模块 */
import { router  } from './base';

// /** 项目模块 */
import { authAPICtrl  } from '../controller';
import {
  ipMid,
  paramMid,
} from '../middleware';
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
 *        "msg": "",
 *        "data": userInfo
 *        "requestId": "reqesutId"
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *        "err": 1060,
 *        "msg": "用户名或密码错误",
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

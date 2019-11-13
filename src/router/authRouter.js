/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 18:01:42
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, captchaMid, paramMid } from '../middleware'
import { authLogic } from '../logic'
import { authCtrl } from '../controller'

/**
 * @apiDefine Auth Auth
 */
/**
 * @api {get} /auth/captcha/sign-in.svg 用户登录验证码
 * @apiVersion 0.1.0
 * @apiDescription 用户登录验证码
 * @apiName get-sign-in-captcha
 * @apiGroup Auth
 *
 * @apiParam (Query) {string} captcha_token 验证码申请凭证（随机数6-128）
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSampleRequest /auth/captcha/sign-in.svg
 */
router.get('/auth/captcha/sign-in.svg', paramMid.joiCheck(authLogic.getCaptcha), captchaMid.getSVGCaptcha('signIn'))

/**
 * @api {post} /auth/muser/do/sign-in 用户登录
 * @apiVersion 0.1.0
 * @apiDescription 用户登录
 * @apiName sign-in
 * @apiGroup Auth
 *
 * @apiParam (Body) {string} identifier 用户名
 * @apiParam (Body) {string} password 密码(md5值)
 * @apiParam (Body) {string} [captcha_token] 验证码token
 * @apiParam (Body) {string} [captcha] 验证码
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccess (data) {string} seq 序号
 * @apiSuccess (data) {string(32)} id 用户ID
 * @apiSuccess (data) {string} name 姓名
 * @apiSuccess (data) {string} gender 性别
 * @apiSuccess (data) {string} phone 手机
 * @apiSuccess (data) {string} email 邮箱
 * @apiSuccess (data) {string} address 家庭住址
 * @apiSuccess (data) {number} height 身高, cm
 * @apiSuccess (data) {number} weight 体重, kg
 * @apiSuccess (data) {string} blood 血型
 * @apiSuccess (data) {date} birthday 出生年月日（ISO8601）
 * @apiSuccess (data) {date} last_seen_at 最后访问时间（ISO8601）
 * @apiSuccess (data) {date} last_sign_at 最后登录时间（ISO8601）
 * @apiSuccess (data) {object} extra_info 额外信息
 * @apiSuccess (data) {int(1)} is_disabled 是否禁用
 * @apiSuccess (data) {date} created_at 创建时间（ISO8601）
 * @apiSuccess (data) {date} updated_at 修改时间（ISO8601）
 *
 * @apiError {string} noSuchMuser 没有此后台用户
 * @apiError {string} invildUsenameOrPassowrd 用户名或密码错误
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 200 Unauthorized
 *     {
 *        "status": 400,
 *        "code": 20030,
 *        "msg": "没有此后台用户",
 *        "ts": ts
 *        "req_id": req_id,
 *     }
 *
 *     HTTP/1.1 200 Unauthorized
 *     {
 *        "status": 400,
 *        "code": 20000,
 *        "msg": "用户名或密码错误",
 *        "ts": ts
 *        "req_id": req_id,
 *     }
 *
 * @apiSampleRequest /auth/muser/do/sign-in
 */
router.post(
  '/auth/muser/do/sign-in',
  paramMid.joiCheck(authLogic.signIn),
  captchaMid.verifySVGCaptha('signIn'),
  authCtrl.run('signIn', 'auth', '登录'),
)

/**
 * @api {get} /auth/muser/do/sign-out 用户登出
 * @apiVersion 0.1.0
 * @apiDescription 用户登出
 * @apiName sign-out
 * @apiGroup Auth
 *
 * @apiHeader {string} x-auth-token 用户认证令牌
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSampleRequest /auth/muser/do/sign-out
 */
router.get('/auth/muser/do/sign-out', authMid.requireSignIn(), authCtrl.run('signOut', 'auth', '登录'))

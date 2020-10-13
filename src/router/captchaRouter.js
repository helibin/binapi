/**
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-02-28 11:09:38
 */

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'
import { captchaMid, paramMid, smsMid } from '../middleware'
import { captchaLogic } from '../logic'

/** 项目模块 */

/**
 * @apiDefine Captcha 验证码
 */
router.get('/captcha/test', captchaMid.genCaptchaTest())

/**
 * @api {get} /captcha/image/do/get 获取图形验证码
 * @apiVersion 0.1.0
 * @apiDescription 获取图形验证码接口
 * @apiName get-captcha
 * @apiGroup Captcha
 *
 * @apiHeader {string} x-auth-token 用户令牌
 *
 * @apiParam (Query) {string} captcha_token 获取验证码凭证
 * @apiParam (Query) {string} cate 分类（CONST.captchaType）
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSampleRequest /captcha/image/do/get
 */
router.get('/captcha/image/do/get', paramMid.joiCheck(captchaLogic.getCaptcha), captchaMid.getSVGCaptcha())

/**
 * @api {post} /captcha/sms-code/do/get 获取短信验证码
 * @apiVersion 0.1.0
 * @apiDescription 获取短信验证码接口
 * @apiName get-sms-code
 * @apiGroup Captcha
 *
 * @apiParam (Query) {string} phone 手机号码
 * @apiParam (Query) {string} cate 分类（CONST.smsCodeType）
 * @apiParam (Query) {string} [len=4] 验证码长度
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSampleRequest /captcha/sms-code/do/get
 */
router.get('/captcha/sms-code/do/get', paramMid.joiCheck(captchaLogic.getSmsCode), smsMid.getAlySmsCode())

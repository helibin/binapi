/*
 * @Author: helibin@139.com
 * @Date: 2019-10-31 10:24:58
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 17:59:56
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, paramMid } from '../middleware'
import { settingLogic } from '../logic'
import { settingCtrl } from '../controller'

/** 预处理 */

/**
 * @apiDefine Setting 设置
 */
/**

/**
 * @api {post} /setting/do/change-password 修改密码 new+
 * @apiVersion 1.0.0
 * @apiDescription 修改密码
 * @apiName change-password
 * @apiGroup Setting
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} old_password 原密码，md5值
 * @apiParam (Param) {string(32)} new_password 新密码，md5值
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": 200,
 *    "code": 0,
 *    "msg": "OK",
 *     "ts": ts,
 *     "req_id": req_id
 *  }
 *
 * @apiSampleRequest /setting/do/change-password
 */
router.post(
  '/setting/do/change-password',
  paramMid.joiCheck(settingLogic.changePassword),
  authMid.requireSignIn(),
  settingCtrl.run('changePassword', 'muser', '修改密码'),
)

/**
 * @api {get} /setting/do/get-info 获取个人信息 new+
 * @apiVersion 1.0.0
 * @apiDescription 获取个人信息
 * @apiName get-info
 * @apiGroup Setting
 *
 * @apiUse commonParam
 *
 * @apiSuccess (data) {string(32)} muser_id 所属后台用户ID
 * @apiSuccess (data) {string} address 地址
 * @apiSuccess (data) {string} bank_name 开户银行
 * @apiSuccess (data) {string} bank_username 开户名
 * @apiSuccess (data) {string} bank_branch 开户支行
 * @apiSuccess (data) {string} bank_account 开户账号
 * @apiSuccess (data) {string} commission_type 分佣模式
 * @apiSuccess (data) {float} commission_ratio 分佣比例, 如：0.85
 * @apiSuccess (data) {string} company_name 公司名称
 * @apiSuccess (data) {date} contract_start 合同开始时间戳（ISO8601）
 * @apiSuccess (data) {date} contract_end 合同截止时间戳（ISO8601）
 * @apiSuccess (data) {string} contract_no 合同编号
 * @apiSuccess (data) {string} email 邮箱
 * @apiSuccess (data) {int} gender 性别
 * @apiSuccess (data) {string} identifier 用户名
 * @apiSuccess (data) {date} last_seen_at 最后访问时间（ISO8601）
 * @apiSuccess (data) {date} last_sign_at 最后登录时间（ISO8601）
 * @apiSuccess (data) {string} name 姓名
 * @apiSuccess (data) {string} phone 手机
 * @apiSuccess (data) {string} type 用户类型（admin|agent|partner）
 * @apiSuccess (data) {object} extra_info 额外信息
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    status: 200,
 *    code: 0,
 *    msg : '成功',
 *    data: [{
 *      "id": "xu_sa",
 *      "creator_id": null,
 *      "editor_id": "xu_sa",
 *      "muser_id": "xu_sa",
 *      "address": null,
 *      "bank_name": null,
 *      "bank_username": null,
 *      "bank_branch": null,
 *      "bank_account": null,
 *      "commission_type": null,
 *      "commission_ratio": null,
 *      "company_name": null,
 *      "contract_start": null,
 *      "contract_end": null,
 *      "contract_no": null,
 *      "email": "sa@jishenglong.com",
 *      "gender": 0,
 *      "identifier": "sa",
 *      "last_seen_at": null,
 *      "last_sign_at": "2019-11-04T03:07:10.000Z",
 *      "name": "超级管理员",
 *      "phone": null,
 *      "privileges": "*",
 *      "type": "admin",
 *      "extra_info": {},
 *      "is_disabled": 0,
 *      "created_at": "2019-10-28T08:54:10.000Z",
 *      "updated_at": "2019-11-04T03:07:10.000Z"
 *    }, ...],
 *    "page_info": {
 *      "total": 1,
 *      "page": 1,
 *      "psize": 32,
 *      "pages": 1
 *    },
 *    "ts": 1572340107608,
 *    "req_id": "a31db4df4adc4785b986abd7a8c52288",
 *  }
 *
 * @apiSampleRequest /setting/do/get-info
 */
router.get('/setting/do/get-info', authMid.requireSignIn(), settingCtrl.run('getInfo'))

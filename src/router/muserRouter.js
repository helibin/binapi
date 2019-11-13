/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-05 11:58:11
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import { router } from './base'

/** 项目模块 */
import { authMid, bizMid, ipMid, paramMid } from '../middleware'
import { muserLogic } from '../logic'
import { muserCtrl } from '../controller'

/** 后台用户 */
/**
 * @apiDefine Muser 后台用户
 */
/**
 * @api {get} /muser/do/query 获取后台用户
 * @apiVersion 1.0.0
 * @apiDescription 获取后台用户
 * @apiName query-muser
 * @apiGroup Muser
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
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
 * @apiSampleRequest /muser/do/query
 */
router.get(
  '/muser/do/query',
  paramMid.joiCheck(muserLogic.query),
  authMid.requireSignIn(),
  muserCtrl.run('query', 'muser'),
)
/**
 * @api {post} /muser/do/add 添加后台用户
 * @apiVersion 1.0.0
 * @apiDescription 添加后台用户
 * @apiName add-muser
 * @apiGroup Muser
 *
 * @apiUse commonParam
 *
 * @apiParam (Body) {string} identifier 用户名
 * @apiParam (Body) {string} type 用户类型（admin|agent|partner）
 * @apiParam (Body) {string} name 姓名
 * @apiParam (Body) {string} phone 手机
 * @apiParam (Body) {string} email 邮箱
 * @apiParam (Body) {int} gender 性别（0|1|2）
 * @apiParam (Body) {string} [password] 密码
 * @apiParam (Body) {string} [muser_id] 所属后台用户ID
 * @apiParam (Body) {object} [extra_info] 额外信息
 *
 * @apiSuccess (data) {string} new_id 新数据ID
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
 *    "data": {
 *      "new_id": new_id
 *    },
 *    "ts": ts,
 *    "req_id": req_id
 *  }
 *
 * @apiSampleRequest /muser/do/add
 */
router.post(
  '/muser/do/add',
  paramMid.joiCheck(muserLogic.add),
  authMid.requireSignIn(),
  bizMid.identifierNotExists('request.body.identifier'),
  muserCtrl.run('add', 'muser', '新增后台用户'),
)
/**
 * @api {post} /muser/:targetId/do/modify 修改后台用户
 * @apiVersion 1.0.0
 * @apiDescription 修改后台用户
 * @apiName modify-muser
 * @apiGroup Muser
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 后台用户ID
 *
 * @apiParam (Body) {string} [identifier] 用户名
 * @apiParam (Body) {string} [type] 用户类型（admin|agent|partner）
 * @apiParam (Body) {string} [name] 姓名
 * @apiParam (Body) {string} [phone] 手机
 * @apiParam (Body) {string} [email] 邮箱
 * @apiParam (Body) {int} [gender] 性别（0|1|2）
 * @apiParam (Body) {string} [password] 密码
 * @apiParam (Body) {string} [muser_id] 所属后台用户ID
 * @apiParam (Body) {object} [extra_info] 额外信息
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
 * @apiSampleRequest /muser/:targetId/do/modify
 */
router.post(
  '/muser/:targetId/do/modify',
  paramMid.joiCheck(muserLogic.modify),
  authMid.requireSignIn(),
  bizMid.commonExists('muser'),
  muserCtrl.run('modify', 'muser', '修改后台用户'),
)
/**
 * @api {post} /muser/:targetId/do/set-disable 修改后台用户
 * @apiVersion 1.0.0
 * @apiDescription 修改后台用户
 * @apiName modify-muser
 * @apiGroup Muser
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 后台用户ID
 *
 * @apiParam (Body) {int} is_disabled 是否禁用（0|1）
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
 * @apiSampleRequest /muser/:targetId/do/modify
 */
router.post(
  '/muser/:targetId/do/set-disable',
  paramMid.joiCheck(muserLogic.setDisable),
  authMid.requireSignIn(),
  bizMid.commonExists('muser'),
  muserCtrl.run('modify', 'muser', '启禁用后台用户'),
)

/**
 * @api {post} /muser/:targetId/do/delete 删除后台用户
 * @apiVersion 1.0.0
 * @apiDescription 删除后台用户
 * @apiName delete-muser
 * @apiGroup Muser
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 后台用户ID
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
 * @apiSampleRequest /muser/:targetId/do/delete
 */
router.post(
  '/muser/:targetId/do/delete',
  paramMid.joiCheck(muserLogic.delete),
  authMid.requireSignIn(),
  bizMid.commonExists('muser'),
  muserCtrl.run('deleteCommon', 'muser', '删除后台用户'),
)

router.get('/muser/do/gen-sa', ipMid.allowAccess(CONFIG.apiServer.ipAddress), muserCtrl.run('genSA'))

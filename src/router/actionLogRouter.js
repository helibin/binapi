/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 18:02:44
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, paramMid } from '../middleware'
import { actionLogLogic } from '../logic'
import { actionLogCtrl } from '../controller'

/**
 * @apiDefine ActionLog 操作日志
 */
/**
 * @api {get} /action-log/do/query 获取操作日志
 * @apiVersion 1.0.0
 * @apiDescription 获取操作日志
 * @apiName query-muser
 * @apiGroup ActionLog
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
 *
 * @apiSuccess (data) {string} email 邮箱
 * @apiSuccess (data) {int} gender 性别
 * @apiSuccess (data) {string} identifier 用户名
 * @apiSuccess (data) {string} phone 手机
 * @apiSuccess (data) {string} name 姓名
 * @apiSuccess (data) {date} last_seen_at 最后访问时间（ISO8601）
 * @apiSuccess (data) {date} last_sign_at 最后登录时间（ISO8601）
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
 *      "id": "2441561b67884594aee95cc0a975b65b",
 *      "muser_id": null,
 *      "action": "登录",
 *      "api": "/auth/muser/do/sign-in",
 *      "content": "用户'undefined'登录, 时间：2019-10-31 21:45:34",
 *      "extra_info": {
 *        "ip": "127.0.0.1",
 *        "os": "unknown",
 *        "ua": "postmanruntime/7.18.0",
 *        "browser": "unknown",
 *        "version": null,
 *        "platform": "unknown"
 *      },
 *      "created_at": "2019-10-28T08:54:10.000Z",
 *      "updated_at": "2019-10-29T13:08:11.000Z"
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
 * @apiSampleRequest /action-log/do/query
 */
router.get(
  '/action-log/do/query',
  paramMid.joiCheck(actionLogLogic.query),
  authMid.requireSignIn(),
  actionLogCtrl.run('queryCommon', 'actionLog'),
)
router.post(
  '/action-log/do/add',
  paramMid.joiCheck(actionLogLogic.add),
  authMid.requireSignIn(),
  actionLogCtrl.run('addCommon', 'actionLog', '新增操作日志'),
)
router.post(
  '/action-log/:targetId/do/modify',
  paramMid.joiCheck(actionLogLogic.modify),
  authMid.requireSignIn(),
  actionLogCtrl.run('modifyCommon', 'actionLog', '修改操作日志'),
)
router.post(
  '/action-log/:targetId/do/delete',
  paramMid.joiCheck(actionLogLogic.delete),
  authMid.requireSignIn(),
  actionLogCtrl.run('deleteCommon', 'actionLog', '删除操作日志'),
)

/*
 * @Author: helibin@139.com
 * @Date: 2019-11-06 15:23:26
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 14:51:06
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, bizMid, paramMid } from '../middleware'
import { deviceGroupLogic } from '../logic'
import { deviceGroupCtrl } from '../controller'

/**
 * @apiDefine DeviceGroup 设备组
 */
/**
 * @api {get} /device-group/do/query 获取设备组 new+
 * @apiVersion 1.0.0
 * @apiDescription 获取设备组
 * @apiName query-device-group
 * @apiGroup DeviceGroup
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
 *
 * @apiSuccess (data) {string} muser_id 所属用户ID
 * @apiSuccess (data) {string} address 地址
 * @apiSuccess (data) {string} area_code 区域代码
 * @apiSuccess (data) {string} area_name 区域名字
 * @apiSuccess (data) {string} name 分组名字
 * @apiSuccess (data) {float} price 收费价格
 * @apiSuccess (data) {string} price_type 收费标准
 * @apiSuccess (data) {int} price_time 价格时长, 分钟
 * @apiSuccess (data) {string} remark 备注
 * @apiSuccess (data) {string} type 设备分组类型(CONST.deviceGroupType)
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
 *      "id": "7052998c8a69481ea6539348cb7d8cf2",
 *      "muser_id": null,
 *      "address": null,
 *      "area_code": null,
 *      "area_name": null,
 *      "name": "test111",
 *      "price": "0.00",
 *      "price_type": null,
 *      "price_time": null,
 *      "remark": null,
 *      "type": null,
 *      "is_disabled": 0,
 *      "created_at": "2019-11-07T10:07:31.000Z",
 *      "updated_at": "2019-11-07T10:07:31.000Z"
 *    }, ...],
 *    "ts": 1572340107608,
 *    "req_id": "a31db4df4adc4785b986abd7a8c52288",
 *  }
 *
 * @apiSampleRequest /device-group/do/query
 */
router.get(
  '/device-group/do/query',
  paramMid.joiCheck(deviceGroupLogic.query),
  authMid.requireSignIn(),
  deviceGroupCtrl.run('queryCommon', 'deviceGroup'),
)
/**
 * @api {post} /device-group/do/add 添加设备组 new+
 * @apiVersion 1.0.0
 * @apiDescription 添加设备组
 * @apiName add-device-group
 * @apiGroup DeviceGroup
 *
 * @apiUse commonParam
 *
 * @apiParam (Body) {string} name 分组名字
 * @apiParam (Body) {string} [muser_id] 所属用户ID
 * @apiParam (Body) {string} [address] 地址
 * @apiParam (Body) {string} [area_code] 区域代码
 * @apiParam (Body) {string} [area_name] 区域名字
 * @apiParam (Body) {float} [price] 收费价格
 * @apiParam (Body) {string} [price_type] 收费标准(CONST.priceMode)
 * @apiParam (Body) {int} [price_time] 价格时长, 分钟
 * @apiParam (Body) {string} [remark] 备注
 * @apiParam (Body) {string} [type] 设备分组类型(CONST.deviceGroupType)
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
 *    "msg": "成功",
 *    "data": {
 *      "new_id": new_id
 *    },
 *    "ts": ts,
 *    "req_id": req_id
 *  }
 *
 * @apiSampleRequest /device-group/do/add
 */
router.post(
  '/device-group/do/add',
  paramMid.joiCheck(deviceGroupLogic.add),
  authMid.requireSignIn(),
  bizMid.commonNotExists('deviceGroup', 'request.body.name', 'name'),
  deviceGroupCtrl.run('addCommon', 'deviceGroup', '添加设备组'),
)
/**
 * @api {post} /device-group/:targetId/do/modify 修改设备组 new+
 * @apiVersion 1.0.0
 * @apiDescription 修改设备组
 * @apiName modify-device-group
 * @apiGroup DeviceGroup
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备组ID
 *
 * @apiParam (Body) {string} [name] 分组名字
 * @apiParam (Body) {string} [muser_id] 所属用户ID
 * @apiParam (Body) {string} [address] 地址
 * @apiParam (Body) {string} [area_code] 区域代码
 * @apiParam (Body) {string} [area_name] 区域名字
 * @apiParam (Body) {float} [price] 收费价格
 * @apiParam (Body) {string} [price_type] 收费标准(CONST.priceMode)
 * @apiParam (Body) {int} [price_time] 价格时长, 分钟
 * @apiParam (Body) {string} [remark] 备注
 * @apiParam (Body) {string} [type] 设备分组类型(CONST.deviceGroupType)
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": 200,
 *    "code": 0,
 *    "msg": "成功",
 *    "ts": ts,
 *    "req_id": req_id
 *  }
 *
 * @apiSampleRequest /device-group/:targetId/do/modify
 */
router.post(
  '/device-group/:targetId/do/modify',
  paramMid.joiCheck(deviceGroupLogic.modify),
  authMid.requireSignIn(),
  bizMid.commonExists('deviceGroup'),
  deviceGroupCtrl.run('modifyCommon', 'deviceGroup', '修改设备组'),
)
/**
 * @api {post} /device-group/:targetId/do/set-disable 启禁用设备组 new+
 * @apiVersion 1.0.0
 * @apiDescription 启禁用设备组
 * @apiName set-disable-device-group
 * @apiGroup DeviceGroup
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备组ID
 *
 * @apiParam (Body) {boolean} is_disable 是否禁用
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": 200,
 *    "code": 0,
 *    "msg": "成功",
 *    "ts": ts,
 *    "req_id": req_id
 *  }
 *
 * @apiSampleRequest /device-group/:targetId/do/set-disable
 */
router.post(
  '/device-group/:targetId/do/set-disable',
  paramMid.joiCheck(deviceGroupLogic.setDisable),
  authMid.requireSignIn(),
  bizMid.commonExists('deviceGroup'),
  deviceGroupCtrl.run('setDisableCommon', 'deviceGroup', '启禁用设备组'),
)
/**
 * @api {post} /device-group/:targetId/do/delete 删除设备组 new+
 * @apiVersion 1.0.0
 * @apiDescription 删除设备组
 * @apiName delete-device-group
 * @apiGroup DeviceGroup
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备组ID
 *
 * @apiUse commonSuccessRes
 * @apiUse commonErrorRes
 *
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": 200,
 *    "code": 0,
 *    "msg": "成功",
 *    "ts": ts,
 *    "req_id": req_id
 *  }
 *
 * @apiSampleRequest /device-group/:targetId/do/delete
 */
router.post(
  '/device-group/:targetId/do/delete',
  paramMid.joiCheck(deviceGroupLogic.delete),
  authMid.requireSignIn(),
  bizMid.commonExists('deviceGroup'),
  deviceGroupCtrl.run('deleteCommon', 'deviceGroup', '删除设备组'),
)

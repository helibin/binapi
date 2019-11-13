/*
 * @Author: helibin@139.com
 * @Date: 2019-11-06 15:23:26
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 15:04:11
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, bizMid, paramMid } from '../middleware'
import { deviceLogic } from '../logic'
import { deviceCtrl } from '../controller'

/**
 * @apiDefine Device 设备
 */
/**
 * @api {get} /device/do/query 获取设备 new+
 * @apiVersion 1.0.0
 * @apiDescription 获取设备
 * @apiName query-device
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
 *
 * @apiSuccess (data) {string} group_id 所属设备组ID
 * @apiSuccess (data) {string} key 产品钥匙ProductKey
 * @apiSuccess (data) {string} secret 设备密钥DeviceSecret
 * @apiSuccess (data) {string} auto_stop 是否充满自停
 * @apiSuccess (data) {string} charing_type 充电类型
 * @apiSuccess (data) {string} code 设备编号
 * @apiSuccess (data) {json} port_info 插口信息
 * @apiSuccess (data) {json} extra_info 额外信息
 * @apiSuccess (data) {json} iot_info iot信息
 * @apiSuccess (data) {string} iot_info.IotId iot设备Id
 * @apiSuccess (data) {string} iot_info.DeviceName iot设备Id
 * @apiSuccess (data) {string} iot_info.ProductKey iot设备产品钥匙
 * @apiSuccess (data) {string} iot_info.DeviceSecret iot设备密钥
 * @apiSuccess (data) {json} iot_status iot状态
 * @apiSuccess (data) {string} lat 纬度
 * @apiSuccess (data) {string} lng 经度
 * @apiSuccess (data) {string} max_power 最大功率, 瓦
 * @apiSuccess (data) {string} name 设备名
 * @apiSuccess (data) {boolean} open 是否对外开放
 * @apiSuccess (data) {int} port 插口数量
 * @apiSuccess (data) {boolean} port_choice 插口自选
 * @apiSuccess (data) {string} range 适用范围
 * @apiSuccess (data) {string} remark 备注
 * @apiSuccess (data) {string} status 状态
 * @apiSuccess (data) {string} work_start 开始营业时间
 * @apiSuccess (data) {string} work_end 结束营业时间
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
 *      "id": "1322f545f53446738a1b6dbea01e05a0",
 *      "group_id": null,
 *      "key": "a1dKj7BO7bg",
 *      "secret": "1V0NGuipPohaxmB2zRyYSQWa5MbRx2Ic",
 *      "auto_stop": null,
 *      "charing_type": null,
 *      "code": "X019045890002",
 *      "port_info": null,
 *      "extra_info": {},
 *      "iot_info": {
 *        "IotId": "RegWCnkPwZkF3lsvZOaK000100",
 *        "JoinEui": "",
 *        "DeviceName": "X019045890002",
 *        "ProductKey": "a1dKj7BO7bg",
 *        "DeviceSecret": "1V0NGuipPohaxmB2zRyYSQWa5MbRx2Ic"
 *      },
 *      "iot_status": {},
 *      "lat": null,
 *      "lng": null,
 *      "max_price": null,
 *      "name": null,
 *      "open": 1,
 *      "port": null,
 *      "port_choice": 1,
 *      "range": null,
 *      "remark": null,
 *      "status": null,
 *      "work_start": null,
 *      "work_end": null,
 *      "type": null,
 *      "is_disabled": 0,
 *      "created_at": "2019-11-06T11:05:46.000Z",
 *      "updated_at": "2019-11-06T11:05:46.000Z"
 *    }, ...],
 *    "ts": 1572340107608,
 *    "req_id": "a31db4df4adc4785b986abd7a8c52288",
 *  }
 *
 * @apiSampleRequest /device/do/query
 */
router.get(
  '/device/do/query',
  paramMid.joiCheck(deviceLogic.query),
  authMid.requireSignIn(),
  deviceCtrl.run('queryCommon', 'device'),
)
/**
 * @api {post} /device/do/add 添加设备 new+
 * @apiVersion 1.0.0
 * @apiDescription 添加设备
 * @apiName add-device
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Body) {string} code 设备编号
 * @apiParam (Body) {string} [group_id] 所属设备组ID
 * @apiParam (Body) {string} [auto_stop] 是否充满自停
 * @apiParam (Body) {string} [charing_type] 充电类型
 * @apiParam (Body) {json} [extra_info] 额外信息
 * @apiParam (Body) {string} [lat] 纬度
 * @apiParam (Body) {string} [lng] 经度
 * @apiParam (Body) {string} [max_power] 最大功率, 瓦
 * @apiParam (Body) {string} [name] 设备名
 * @apiParam (Body) {boolean} [open] 是否对外开放
 * @apiParam (Body) {int} [port] 插口数量
 * @apiParam (Body) {boolean} [port_choice] 插口自选
 * @apiParam (Body) {string} [range] 适用范围
 * @apiParam (Body) {string} [remark] 备注
 * @apiParam (Body) {string} [status] 状态
 * @apiParam (Body) {string} [work_start] 开始营业时间
 * @apiParam (Body) {string} [work_end] 结束营业时间
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
 * @apiSampleRequest /device/do/add
 */
router.post(
  '/device/do/add',
  paramMid.joiCheck(deviceLogic.add),
  authMid.requireSignIn(),
  bizMid.deviceCodeNotRegister(),
  deviceCtrl.run('add', 'device', '添加设备'),
)
/**
 * @api {post} /device/:targetId/do/modify 修改设备 new+
 * @apiVersion 1.0.0
 * @apiDescription 修改设备
 * @apiName modify-device
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备ID
 *
 * @apiParam (Body) {string} [group_id] 所属设备组ID
 * @apiParam (Body) {string} [auto_stop] 是否充满自停
 * @apiParam (Body) {string} [charing_type] 充电类型
 * @apiParam (Body) {json} [extra_info] 额外信息
 * @apiParam (Body) {string} [lat] 纬度
 * @apiParam (Body) {string} [lng] 经度
 * @apiParam (Body) {string} [max_power] 最大功率, 瓦
 * @apiParam (Body) {string} [name] 设备名
 * @apiParam (Body) {boolean} [open] 是否对外开放
 * @apiParam (Body) {int} [port] 插口数量
 * @apiParam (Body) {boolean} [port_choice] 插口自选
 * @apiParam (Body) {string} [range] 适用范围
 * @apiParam (Body) {string} [remark] 备注
 * @apiParam (Body) {string} [status] 状态
 * @apiParam (Body) {string} [work_start] 开始营业时间
 * @apiParam (Body) {string} [work_end] 结束营业时间
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
 * @apiSampleRequest /device/:targetId/do/modify
 */
router.post(
  '/device/:targetId/do/modify',
  paramMid.joiCheck(deviceLogic.modify),
  authMid.requireSignIn(),
  bizMid.commonExists('device'),
  deviceCtrl.run('modify', 'device', '修改设备'),
)
/**
 * @api {post} /device/:targetId/do/set-disable 启禁用设备 new+
 * @apiVersion 1.0.0
 * @apiDescription 启禁用设备
 * @apiName set-disable-device
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备ID
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
 * @apiSampleRequest /device/:targetId/do/set-disable
 */
router.post(
  '/device/:targetId/do/set-disable',
  paramMid.joiCheck(deviceLogic.setDisable),
  authMid.requireSignIn(),
  bizMid.commonExists('device'),
  deviceCtrl.run('setDisable', 'device', '启禁用设备'),
)
/**
 * @api {post} /device/:targetId/do/delete 删除设备 new+
 * @apiVersion 1.0.0
 * @apiDescription 删除设备
 * @apiName delete-device
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 设备ID
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
 * @apiSampleRequest /device/:targetId/do/delete
 */
router.post(
  '/device/:targetId/do/delete',
  paramMid.joiCheck(deviceLogic.delete),
  authMid.requireSignIn(),
  bizMid.commonExists('device'),
  deviceCtrl.run('delete', 'device', '删除设备'),
)

router.post(
  '/device/do/apply',
  paramMid.joiCheck(deviceLogic.apply),
  bizMid.commonNotExists('device', 'request.body.code', 'code'),
  deviceCtrl.run('add', 'device', '申请设备'),
)

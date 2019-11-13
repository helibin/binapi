/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 21:28:10
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, paramMid } from '../middleware'
import { goodsLogic } from '../logic'
import { goodsCtrl } from '../controller'

/**
 * @apiDefine Device 商品
 */
/**
 * @api {get} /goods/do/query 获取商品 new+
 * @apiVersion 1.0.0
 * @apiDescription 获取商品
 * @apiName query-goods
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
 *
 * @apiSuccess (data) {string} name 名称
 * @apiSuccess (data) {string} price 价格
 * @apiSuccess (data) {string} relief 优惠力度
 * @apiSuccess (data) {string} relief_type 优惠类型
 * @apiSuccess (data) {string} time_start 上架时间
 * @apiSuccess (data) {string} time_end 下架时间
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
 *      "id": "0f519b7a8aa94fe6879d1fd7ab76705e",
 *      "name": "test",
 *      "price": "10.00",
 *      "relief": "1.00",
 *      "relief_type": "present",
 *      "time_start": null,
 *      "time_end": null,
 *      "is_disabled": 0,
 *      "created_at": "2019-11-07T09:20:39.000Z",
 *      "updated_at": "2019-11-07T09:21:06.000Z"
 *    }, ...],
 *    "ts": 1572340107608,
 *    "req_id": "a31db4df4adc4785b986abd7a8c52288",
 *  }
 *
 * @apiSampleRequest /goods/do/query
 */
router.get(
  '/goods/do/query',
  paramMid.joiCheck(goodsLogic.query),
  authMid.requireSignIn(),
  goodsCtrl.run('queryCommon', 'goods'),
)
/**
 * @api {post} /goods/do/add 添加商品 new+
 * @apiVersion 1.0.0
 * @apiDescription 添加商品
 * @apiName add-goods
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Body) {string} name 名称
 * @apiParam (Body) {string} price 价格
 * @apiParam (Body) {string} relief 优惠力度
 * @apiParam (Body) {string} relief_type 优惠类型(CONST.reliefType)
 * @apiParam (Body) {string} time_start 上架时间
 * @apiParam (Body) {string} time_end 下架时间
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
 * @apiSampleRequest /goods/do/add
 */
router.post(
  '/goods/do/add',
  paramMid.joiCheck(goodsLogic.add),
  authMid.requireSignIn(),
  goodsCtrl.run('addCommon', 'goods', '新增商品'),
)
/**
 * @api {post} /goods/:targetId/do/modify 修改商品 new+
 * @apiVersion 1.0.0
 * @apiDescription 修改商品
 * @apiName modify-goods
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 商品ID
 *
 * @apiParam (Body) {string} name 名称
 * @apiParam (Body) {string} price 价格
 * @apiParam (Body) {string} relief 优惠力度
 * @apiParam (Body) {string} relief_type 优惠类型(CONST.reliefType)
 * @apiParam (Body) {string} time_start 上架时间
 * @apiParam (Body) {string} time_end 下架时间
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
 * @apiSampleRequest /goods/:targetId/do/modify
 */
router.post(
  '/goods/:targetId/do/modify',
  paramMid.joiCheck(goodsLogic.modify),
  authMid.requireSignIn(),
  goodsCtrl.run('modifyCommon', 'goods', '修改商品'),
)
/**
 * @api {post} /goods/:targetId/do/set-disable 启禁用商品 new+
 * @apiVersion 1.0.0
 * @apiDescription 启禁用商品
 * @apiName set-disable-goods
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 商品ID
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
 * @apiSampleRequest /goods/:targetId/do/set-disable
 */
router.post(
  '/goods/:targetId/do/set-disable',
  paramMid.joiCheck(goodsLogic.setDisable),
  authMid.requireSignIn(),
  goodsCtrl.run('setDisableCommon', 'goods', '启禁用商品'),
)
/**
 * @api {post} /goods/:targetId/do/delete 删除商品 new+
 * @apiVersion 1.0.0
 * @apiDescription 删除商品
 * @apiName delete-goods
 * @apiGroup Device
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 商品ID
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
 * @apiSampleRequest /goods/:targetId/do/delete
 */
router.post(
  '/goods/:targetId/do/delete',
  paramMid.joiCheck(goodsLogic.delete),
  authMid.requireSignIn(),
  goodsCtrl.run('deleteCommon', 'goods', '删除商品'),
)

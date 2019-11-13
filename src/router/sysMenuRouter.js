/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 18:06:10
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, paramMid } from '../middleware'
import { sysMenuLogic } from '../logic'
import { sysMenuCtrl } from '../controller'

/**
 * @apiDefine SysMenu 系统菜单
 */
/**
 * @api {get} /sys-menu/do/query 获取系统菜单 new+
 * @apiVersion 1.0.0
 * @apiDescription 获取系统菜单
 * @apiName query-sys-menu
 * @apiGroup SysMenu
 *
 * @apiUse commonParam
 *
 * @apiParam (Query) {string(32)} [id] 详情ID
 *
 * @apiSuccess (data) {string} menu_pid 所属菜单ID
 * @apiSuccess (data) {string} directory 目录
 * @apiSuccess (data) {string} name 菜单名字
 * @apiSuccess (data) {string} icon 图标
 * @apiSuccess (data) {int} order 顺序
 * @apiSuccess (data) {string} remark 备注
 * @apiSuccess (data) {string} route 路由
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
 *      "id": "1f0a3b3c44554a43a241e13b1c388567",
 *      "menu_pid": null,
 *      "directory": "/",
 *      "name": "首页",
 *      "icon": null,
 *      "order": 0,
 *      "remark": "skd",
 *      "route": "/",
 *      "created_at": "2019-10-28T09:45:02.000Z",
 *      "updated_at": "2019-10-28T09:45:02.000Z"
 *    }, ...],
 *    "ts": 1572340107608,
 *    "req_id": "a31db4df4adc4785b986abd7a8c52288",
 *  }
 *
 * @apiSampleRequest /sys-menu/do/query
 */
router.get(
  '/sys-menu/do/query',
  paramMid.joiCheck(sysMenuLogic.query),
  authMid.requireSignIn(),
  sysMenuCtrl.run('queryCommon', 'sysMenu'),
)
/**
 * @api {post} /sys-menu/do/add 添加系统菜单
 * @apiVersion 1.0.0
 * @apiDescription 添加系统菜单
 * @apiName add-sys-menu
 * @apiGroup SysMenu
 *
 * @apiUse commonParam
 *
 * @apiParam (Body) {string} name 菜单名字
 * @apiParam (Body) {string} route 路由
 * @apiParam (Body) {string} [menu_pid] 所属菜单ID
 * @apiParam (Body) {string} [directory] 目录
 * @apiParam (Body) {string} [icon] 图标
 * @apiParam (Body) {int} [order] 顺序
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
 * @apiSampleRequest /sys-menu/do/add
 */
router.post(
  '/sys-menu/do/add',
  paramMid.joiCheck(sysMenuLogic.add),
  authMid.requireSignIn(),
  sysMenuCtrl.run('addCommon', 'sysMenu', '添加系统菜单'),
)
/**
 * @api {post} /sys-menu/:targetId/do/modify 修改系统菜单
 * @apiVersion 1.0.0
 * @apiDescription 修改系统菜单
 * @apiName modify-sys-menu
 * @apiGroup SysMenu
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 菜单ID
 *
 * @apiParam (Body) {string} [name] 菜单名字
 * @apiParam (Body) {string} [route] 路由
 * @apiParam (Body) {string} [menu_pid] 所属菜单ID
 * @apiParam (Body) {string} [directory] 目录
 * @apiParam (Body) {string} [icon] 图标
 * @apiParam (Body) {int} [order] 顺序
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
 * @apiSampleRequest /sys-menu/:targetId/do/modify
 */
router.post(
  '/sys-menu/:targetId/do/modify',
  paramMid.joiCheck(sysMenuLogic.modify),
  authMid.requireSignIn(),
  sysMenuCtrl.run('modifyCommon', 'sysMenu', '修改系统菜单'),
)
/**
 * @api {post} /sys-menu/:targetId/do/set-disable 启禁用系统菜单
 * @apiVersion 1.0.0
 * @apiDescription 启禁用系统菜单
 * @apiName set-disable-sys-menu
 * @apiGroup SysMenu
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 菜单ID
 *
 * @apiParam (Body) {string} is_disable 是否禁用
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
 * @apiSampleRequest /sys-menu/:targetId/do/set-disable
 */
router.post(
  '/sys-menu/:targetId/do/set-disable',
  paramMid.joiCheck(sysMenuLogic.setDisable),
  authMid.requireSignIn(),
  sysMenuCtrl.run('setDisableCommon', 'sysMenu', '启禁用系统菜单'),
)
/**
 * @api {post} /sys-menu/:targetId/do/delete 删除系统菜单
 * @apiVersion 1.0.0
 * @apiDescription 删除系统菜单
 * @apiName delete-sys-menu
 * @apiGroup SysMenu
 *
 * @apiUse commonParam
 *
 * @apiParam (Param) {string(32)} targetId 菜单ID
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
 * @apiSampleRequest /sys-menu/:targetId/do/delete
 */
router.post(
  '/sys-menu/:targetId/do/delete',
  paramMid.joiCheck(sysMenuLogic.delete),
  authMid.requireSignIn(),
  sysMenuCtrl.run('deleteCommon', 'sysMenu', '删除系统菜单'),
)

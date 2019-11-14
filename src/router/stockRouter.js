/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-14 15:46:41
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { ipMid, paramMid } from '../middleware'
import { stockLogic } from '../logic'
import { stockCtrl } from '../controller'

router.get(
  '/stock/do/query',
  paramMid.joiCheck(stockLogic.query),
  ipMid.allowAccess(),
  // authMid.requireSignIn(),
  stockCtrl.run('queryCommon', 'stock'),
)
router.post(
  '/stock/do/add',
  paramMid.joiCheck(stockLogic.add),
  ipMid.allowAccess(),
  // authMid.requireSignIn(),
  stockCtrl.run('addCommon', 'stock', '新增股票'),
)
router.post(
  '/stock/:targetId/do/modify',
  paramMid.joiCheck(stockLogic.modify),
  ipMid.allowAccess(),
  // authMid.requireSignIn(),
  stockCtrl.run('modifyCommon', 'stock', '修改股票'),
)
router.post(
  '/stock/:targetId/do/set-disable',
  paramMid.joiCheck(stockLogic.setDisable),
  ipMid.allowAccess(),
  // authMid.requireSignIn(),
  stockCtrl.run('setDisableCommon', 'stock', '启禁用股票'),
)
router.post(
  '/stock/:targetId/do/delete',
  paramMid.joiCheck(stockLogic.delete),
  ipMid.allowAccess(),
  // authMid.requireSignIn(),
  stockCtrl.run('deleteCommon', 'stock', '删除股票'),
)

router.get(
  '/stock/do/watch',
  paramMid.joiCheck(stockLogic.watch),
  ipMid.allowAccess(),
  stockCtrl.run('watch', 'stock', '监控股票'),
)

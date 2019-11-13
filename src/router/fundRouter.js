/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 21:23:22
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, paramMid } from '../middleware'
import { fundLogic } from '../logic'
import { fundCtrl } from '../controller'

router.get(
  '/fund/do/query',
  paramMid.joiCheck(fundLogic.query),
  authMid.requireSignIn(),
  fundCtrl.run('queryCommon', 'fund'),
)
router.post(
  '/fund/do/add',
  paramMid.joiCheck(fundLogic.add),
  authMid.requireSignIn(),
  fundCtrl.run('addCommon', 'fund', '新增基金'),
)
router.post(
  '/fund/:targetId/do/modify',
  paramMid.joiCheck(fundLogic.modify),
  authMid.requireSignIn(),
  fundCtrl.run('modifyCommon', 'fund', '修改基金'),
)
router.post(
  '/fund/:targetId/do/set-disable',
  paramMid.joiCheck(fundLogic.setDisable),
  authMid.requireSignIn(),
  fundCtrl.run('setDisableCommon', 'fund', '启禁用基金'),
)
router.post(
  '/fund/:targetId/do/delete',
  paramMid.joiCheck(fundLogic.delete),
  authMid.requireSignIn(),
  fundCtrl.run('deleteCommon', 'fund', '删除基金'),
)

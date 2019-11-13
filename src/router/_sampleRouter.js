/*
 * @Author: helibin@139.com
 * @Date: 2019-10-28 15:47:06
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 17:56:22
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { _sampleCtrl } from '../controller'
import { _sampleLogic } from '../logic'
import { authMid, paramMid } from '../middleware'

router.get(
  '/sample/do/query',
  paramMid.joiCheck(_sampleLogic.query),
  authMid.requireSignIn(),
  _sampleCtrl.run('queryCommon', 'sample'),
)
router.get(
  '/sample/do/list',
  paramMid.joiCheck(_sampleLogic.list),
  authMid.requireSignIn(),
  _sampleCtrl.run('listCommon', 'sample'),
)
router.get(
  '/sample/:targetId/do/get',
  paramMid.joiCheck(_sampleLogic.get),
  authMid.requireSignIn(),
  _sampleCtrl.run('getCommon', 'sample'),
)
router.post(
  '/sample/do/add',
  paramMid.joiCheck(_sampleLogic.add),
  authMid.requireSignIn(),
  _sampleCtrl.run('addCommon', 'sample', '新增样板'),
)
router.post(
  '/sample/:targetId/do/modify',
  paramMid.joiCheck(_sampleLogic.modify),
  authMid.requireSignIn(),
  _sampleCtrl.run('modifyCommon', 'sample', '修改样板'),
)
router.post(
  '/sample/:targetId/do/set-disable',
  paramMid.joiCheck(_sampleLogic.setDisable),
  authMid.requireSignIn(),
  _sampleCtrl.run('setDisableCommon', 'sample', '启禁用样板'),
)
router.post(
  '/sample/:targetId/do/delete',
  paramMid.joiCheck(_sampleLogic.delete),
  authMid.requireSignIn(),
  _sampleCtrl.run('deleteCommon', 'sample', '删除样板'),
)

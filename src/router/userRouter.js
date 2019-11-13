/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 18:01:32
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { authMid, bizMid, paramMid } from '../middleware'
import { userLogic } from '../logic'
import { userCtrl } from '../controller'

router.get(
  '/users/do/queryCommon',
  paramMid.joiCheck(userLogic.query),
  authMid.requireSignIn(),
  userCtrl.run('queryCommon'),
)

router.post(
  '/users/:targetId/do/modify',
  paramMid.joiCheck(userLogic.modify),
  authMid.requireSignIn(),
  bizMid.commonExists('user'),
  userCtrl.run('modifyCommon', 'user', '修改用户'),
)

router.post(
  '/users/:targetId/do/set-disable',
  paramMid.joiCheck(userLogic.setDisable),
  authMid.requireSignIn(),
  bizMid.commonExists('user'),
  userCtrl.run('setDisableCommon', 'user', '启禁用用户'),
)

router.get(
  '/users/:targetId/do/delete',
  paramMid.joiCheck(userLogic.delete),
  authMid.requireSignIn(),
  bizMid.commonExists('user'),
  userCtrl.run('deleteCommon', 'user', '删除用户'),
)

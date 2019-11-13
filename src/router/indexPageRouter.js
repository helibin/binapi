/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-10-31 20:06:48
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { pageRouter } from './base'

/** 项目模块 */
import { indexPageCtrl } from '../controller'
import { authMid } from '../middleware'

pageRouter.get('/', indexPageCtrl.index)

pageRouter.get('/apidoc/index', indexPageCtrl.apidoc)

pageRouter.get('/mapidoc/index', authMid.requireSignIn(), indexPageCtrl.mapidoc)

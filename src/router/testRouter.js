/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-08 11:58:51
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'

/** 项目模块 */
import { testLogic } from '../logic'
import { paramMid } from '../middleware'
import { testCtrl } from '../controller'

router.all('/test', paramMid.joiCheck(testLogic.test), testCtrl.run('test'))

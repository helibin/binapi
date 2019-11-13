/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:11:25
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 20:32:33
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base'
import { CONFIG } from '../helper'

/** 项目模块 */
import { weixinCtrl } from '../controller'
import { ipMid } from '../middleware'

router.get('/wx/check-sign', ipMid.allowAccess(CONFIG.wxServer.ipList), weixinCtrl.run('checkSign'))

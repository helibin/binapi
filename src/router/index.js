/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-16 18:33:32
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { router, pageRouter } from './base'

// index
require('./indexRouter')
require('./indexPageRouter')

// API
require('./captchaRouter')
require('./testRouter')

require('./authRouter')
require('./userRouter')
require('./muserRouter')

require('./settingRouter')
require('./sysMenuRouter')
require('./actionLogRouter')

export { router, pageRouter }

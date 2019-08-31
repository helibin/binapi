/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-27 14:46:54
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { router, pageRouter } from './base';


// API
require('./authRouter');
require('./captchaRouter');
require('./dabasesRouter');
require('./indexRouter');
require('./testsRouter');
require('./usersRouter');
require('./weixinRouter');

// PAGE
require('./indexPageRouter');

export { router, pageRouter };

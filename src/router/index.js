/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-17 20:00:22
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

// PAGE
require('./indexPageRouter');

export { router, pageRouter };

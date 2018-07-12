/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { router, pageRouter } from './base';
// API
require('./authAPIRouter');
require('./captchaAPIRouter');
require('./indexAPIRouter');
require('./likesAPIRouter');
require('./testsAPIRouter');
require('./usersAPIRouter');

// PAGE
require('./indexPageRouter');

export { router, pageRouter };

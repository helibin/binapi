/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { router, pageRouter } from './_base';
// API
require('./indexAPIRouter');
require('./usersAPIRouter');
require('./authAPIRouter');
require('./likesAPIRouter');
require('./testsAPIRouter');

// PAGE
require('./indexPageRouter');

export { router, pageRouter };

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-17 18:54:51
 */
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

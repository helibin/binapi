/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-17 19:02:24
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './base';

/** 项目模块 */
import { templatesAPICtrl } from '../controller';


router.get('/templates',
  templatesAPICtrl.run('list'));

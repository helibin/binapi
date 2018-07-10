
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './base';

/** 项目模块 */
import { templatesAPICtrl } from '../controller';


router.get('/templates',
  templatesAPICtrl.run('list'));

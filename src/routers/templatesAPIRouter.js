
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './_base';

/** 项目模块 */
import { templatesAPICtrl } from '../controllers';


router.get('/templates',
  (...args) => templatesAPICtrl.run('list', ...args));

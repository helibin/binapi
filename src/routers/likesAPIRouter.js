/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './_base';

/** 项目模块 */
import { likesAPICtrl } from '../controllers';


router.get('/likes',
  (...args) => likesAPICtrl.run('list', ...args));

router.post('/likes',
  (...args) => likesAPICtrl.run('add', ...args));

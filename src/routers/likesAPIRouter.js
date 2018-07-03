/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { likesAPICtrl } from '../controllers';
import { router }       from './_base';


router.get('/likes',
  (...args) => likesAPICtrl.run('list', ...args));

router.post('/likes',
  (...args) => likesAPICtrl.run('add', ...args));

export default router;

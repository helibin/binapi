/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './base';

/** 项目模块 */
import { likesAPICtrl } from '../controller';


router.get('/likes',
  (...args) => likesAPICtrl.run('list', ...args));

router.post('/likes',
  (...args) => likesAPICtrl.run('add', ...args));

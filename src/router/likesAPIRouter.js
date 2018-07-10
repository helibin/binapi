/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { likesAPICtrl } from '../controller';


router.get('/likes',
  likesAPICtrl.run('list'));

router.post('/likes',
  likesAPICtrl.run('add'));

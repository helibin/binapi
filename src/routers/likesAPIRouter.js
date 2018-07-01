/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { likesAPICtrl } from '../controllers';
import { router }       from './_base';


router.get('/likes',
  likesAPICtrl.list);

router.post('/likes',
  likesAPICtrl.add);

export default router;

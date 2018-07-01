/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { usersAPICtrl } from '../controllers';
import { router }       from './_base';


router.get('/users',
  usersAPICtrl.list);

router.get('/users/:targetId',
  usersAPICtrl.get);

router.post('/users',
  usersAPICtrl.add);

router.patch('/users/:targetId',
  usersAPICtrl.modify);

router.delete('/users/:targetId',
  usersAPICtrl.delete);

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './_base';

/** 项目模块 */
import { usersAPICtrl } from '../controllers';


router.get('/users',
  (...args) => usersAPICtrl.run('list', ...args));

router.get('/users/:targetId',
  (...args) => usersAPICtrl.run('get', ...args));

router.post('/users',
  (...args) => usersAPICtrl.run('add', ...args));

router.patch('/users/:targetId',
  (...args) => usersAPICtrl.run('modify', ...args));

router.delete('/users/:targetId',
  (...args) => usersAPICtrl.run('delete', ...args));

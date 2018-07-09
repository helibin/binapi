/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { usersAPICtrl } from '../controller';
import { authMid } from '../middleware';

router.get('/users',
  authMid.requireSignIn(),
  authMid.requirePrivilege('users_list'),
  (...args) => usersAPICtrl.run('list', ...args));

router.get('/users/:targetId',
  authMid.requirePrivilege('users_get'),
  (...args) => usersAPICtrl.run('get', ...args));

router.post('/users',
  authMid.requirePrivilege('users_add'),
  (...args) => usersAPICtrl.run('add', ...args));

router.patch('/users/:targetId',
  authMid.requirePrivilege('users_modify'),
  (...args) => usersAPICtrl.run('modify', ...args));

router.delete('/users/:targetId',
  authMid.requirePrivilege('users_delete'),
  (...args) => usersAPICtrl.run('delete', ...args));

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 15:55:47
 */
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
  usersAPICtrl.run('list'));

router.get('/users/:targetId',
  authMid.requirePrivilege('users_get'),
  usersAPICtrl.run('get'));

router.post('/users',
  authMid.requirePrivilege('users_add'),
  usersAPICtrl.run('add'));

router.put('/users/:targetId',
  authMid.requirePrivilege('users_modify'),
  usersAPICtrl.run('modify'));

router.delete('/users/:targetId',
  authMid.requirePrivilege('users_delete'),
  usersAPICtrl.run('delete'));

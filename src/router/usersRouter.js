/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 20:42:00
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { usersCtrl } from '../controller';
import { authMid, bizMid } from '../middleware';

router.get('/users',
  authMid.requireSignIn(),
  authMid.requirePrivilege('users_list'),
  usersCtrl.run('list'));

router.get('/users/:targetId',
  authMid.requireSignIn(),
  bizMid.userExists(),
  authMid.requirePrivilege('users_get'),
  usersCtrl.run('get'));

router.post('/users',
  authMid.requireSignIn(),
  authMid.requirePrivilege('users_add'),
  bizMid.run('userNotExists', 'request.body.identifier'),
  usersCtrl.run('add'));

router.put('/users/:targetId',
  authMid.requireSignIn(),
  authMid.requirePrivilege('users_modify'),
  bizMid.run('userExists'),
  usersCtrl.run('modify'));

router.delete('/users/:targetId',
  authMid.requireSignIn(),
  authMid.requirePrivilege('users_delete'),
  bizMid.run('userExists'),
  usersCtrl.run('delete'));

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-25 22:26:18
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 23:48:06
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { authMid } from '../middleware';
import { databasesAPICtrl } from '../controller';


router.get('/databases/init',
  authMid.requireSignIn(),
  authMid.requirePrivilege('dba_databasesInit'),
  databasesAPICtrl.run('init'));

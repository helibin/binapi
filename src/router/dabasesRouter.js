/*
 * @Author: helibin@139.com
 * @Date: 2018-07-25 22:26:18
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 10:44:41
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { ipMid } from '../middleware';
import { databasesCtrl } from '../controller';


router.get('/databases/init',
  ipMid.allowAccess(),
  databasesCtrl.run('init'));

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 18:49:41
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { likesCtrl } from '../controller';


router.get('/likes',
  likesCtrl.run('list'));

router.post('/likes',
  likesCtrl.run('add'));

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-30 22:51:01
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { testsCtrl } from '../controller';


router.get('/tests',
  testsCtrl.run('test'));

router.get('/tests/location',
  testsCtrl.run('location'));

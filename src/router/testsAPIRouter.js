/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './base';

/** 项目模块 */
import { testsAPICtrl } from '../controller';


router.get('/tests',
  testsAPICtrl.run('test'));

router.get('/tests/location',
  testsAPICtrl.run('location'));

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './_base';

/** 项目模块 */
import { testsAPICtrl } from '../controllers';


router.get('/tests',
  (...args) => testsAPICtrl.run('test', ...args));

router.get('/tests/location',
  (...args) => testsAPICtrl.run('location', ...args));

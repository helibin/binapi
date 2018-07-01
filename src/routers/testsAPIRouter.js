/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { testsAPICtrl } from '../controllers';
import { router }       from './_base';


router.get('/tests',
  testsAPICtrl.test);

router.get('/tests/location',
  testsAPICtrl.location);

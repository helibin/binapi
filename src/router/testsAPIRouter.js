/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }       from './base';

/** 项目模块 */
import { testsAPICtrl } from '../controller';


router.get('/tests',
  (...args) => testsAPICtrl.run('test', ...args));

router.get('/tests/location',
  (...args) => testsAPICtrl.run('location', ...args));

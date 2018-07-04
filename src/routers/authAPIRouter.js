/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router }      from './_base';

/** 项目模块 */
import { authAPICtrl } from '../controllers';


router.post('/auth/sign-in',
  (...args) => authAPICtrl.run('signIn', ...args));

router.post('/auth/sign-up',
  (...args) => authAPICtrl.run('signUp', ...args));

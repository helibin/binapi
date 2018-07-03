/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { authAPICtrl } from '../controllers';
import { router }      from './_base';


router.post('/auth/sign-in',
  (...args) => authAPICtrl.run('signIn', ...args));

router.post('/auth/sign-up',
  (...args) => authAPICtrl.run('signUp', ...args));

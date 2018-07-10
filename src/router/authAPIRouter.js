/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { authAPICtrl } from '../controller';
import { ipMid, paramMid } from '../middleware';
import { authLgc } from '../logic';


router.post('/auth/sign-in',
  paramMid.check(authLgc.signIn),
  (...args) => authAPICtrl.run('signIn', ...args));

router.post('/auth/sign-up',
  ipMid.allowAccess(),
  paramMid.check(authLgc.signUp),
  (...args) => authAPICtrl.run('signUp', ...args));

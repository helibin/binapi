/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';
import { captcha } from '../helper';

/** 项目模块 */

router.get('/captcha/sign-up',
  captcha.getSVGCaptha('sign-up'));

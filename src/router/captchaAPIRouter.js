/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';
import { captchaMid, paramMid } from '../middleware';
import { captchaLgc } from '../logic';

/** 项目模块 */

router.get('/captcha/sign-up/:token.svg',
  paramMid.check(captchaLgc.getSVGCaptcha),
  captchaMid.getSVGCaptcha('sign-up'));

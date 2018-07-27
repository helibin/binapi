/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 14:47:29
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';
import { captchaMid, paramMid } from '../middleware';
import { captchaLogic } from '../logic';

/** 项目模块 */

router.get('/captcha/sign-up/:token.svg',
  paramMid.run('joiCheck', captchaLogic.getSVGCaptcha),
  captchaMid.getSVGCaptcha('sign-up'));

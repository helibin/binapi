/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-05 15:19:23
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';
import { captchaMid, paramMid } from '../middleware';
import { captchaLogic } from '../logic';

/** 项目模块 */

router.get('/captcha/sign-up.svg',
  paramMid.joiCheck(captchaLogic.getSVGCaptcha),
  captchaMid.genSVGCaptcha('sign-up'));

router.get('/captcha/sign-in.svg',
  paramMid.joiCheck(captchaLogic.getSVGCaptcha),
  captchaMid.genSVGCaptcha('sign-in'));

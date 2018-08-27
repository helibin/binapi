/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:11:25
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-27 14:36:39
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { weixinCtrl } from '../controller';
import { ipMid } from '../middleware';

router.get('/wx/check-sign',
  ipMid.allowAccess(),
  weixinCtrl.run('checkSign'));

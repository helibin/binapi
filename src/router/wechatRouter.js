/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:11:25
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-24 15:56:02
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './base';

/** 项目模块 */
import { wechatCtrl } from '../controller';
import { ipMid } from '../middleware';

router.get('/wx/check-token',
  ipMid.allowAccess(),
  wechatCtrl.run('checkToken'));

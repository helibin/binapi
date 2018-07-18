/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-18 10:41:23
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { pageRouter }    from './base';

/** 项目模块 */
import { indexPageCtrl } from '../controller';
import { authMid } from '../middleware';


pageRouter.get('/',
  indexPageCtrl.run('index'));

pageRouter.get('/apidoc/index.html',
  indexPageCtrl.run('apidoc'));

pageRouter.get('/apidoc-internal/index',
  authMid.requireSignIn(),
  indexPageCtrl.run('apidocInternal'));

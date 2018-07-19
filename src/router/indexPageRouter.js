/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-19 13:50:07
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

pageRouter.get('/apidoc/index',
  indexPageCtrl.run('apidoc'));

pageRouter.get('/apidoc-internal/index.html',
  authMid.requireSignIn(),
  indexPageCtrl.run('apidocInternal'));

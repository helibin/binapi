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

pageRouter.get('/apidoc-internal/index.html',
  authMid.requireSignIn(),
  indexPageCtrl.run('apidocInternal'));

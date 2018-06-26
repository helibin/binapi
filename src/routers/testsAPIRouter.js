/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import Ctrl from '../controllers/testsAPICtrl';


const apiRouter = new Router({ prefix: CONFIG.apiServer.prefix });

apiRouter.get('/tests',
  Ctrl.test);

apiRouter.get('/tests/location',
  Ctrl.location);

export default apiRouter;

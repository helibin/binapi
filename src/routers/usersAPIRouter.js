

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import Ctrl from '../controllers/usersAPICtrl';


const apiRouter = new Router({ prefix: CONFIG.apiServer.prefix });

apiRouter.get('/users',
  Ctrl.listUsers);

apiRouter.get('/users/:targetId',
  Ctrl.getUser);

apiRouter.post('/users',
  Ctrl.addUser);

apiRouter.patch('/users/:targetId',
  Ctrl.modifyUser);

apiRouter.delete('/users/:targetId',
  Ctrl.deleteUser);

export default apiRouter;

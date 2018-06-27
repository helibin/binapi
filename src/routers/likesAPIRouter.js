/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */
import Ctrl from '../controllers/likesAPICtrl';


const apiRouter = new Router({ prefix: CONFIG.apiServer.prefix });

apiRouter.get('/likes', Ctrl.listLikes);

apiRouter.post('/likes', Ctrl.addLike);

export default apiRouter;

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */
import CONFIG from 'config';

/** 项目模块 */

const apiRouter = new Router({ prefix: CONFIG.apiServer.prefix });

apiRouter.get('/index', async (ctx) => {
  ctx.body = [{
    name: 'sdw',
    sex : 'f',
  }, {
    name: '2rsa',
    sex : 'm',
  }];
});

export default apiRouter;

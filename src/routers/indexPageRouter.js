

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router';

/** 基础模块 */

/** 项目模块 */
import Ctrl from '../controllers/indexPageCtrl';


const router = new Router();

router.get('/',
  Ctrl.index);

export default router;

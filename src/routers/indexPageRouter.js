/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { indexPageCtrl } from '../controllers';
import { pageRouter }    from './_base';


pageRouter.get('/',
  (...args) => indexPageCtrl.run('index', ...args));

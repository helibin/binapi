/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { pageRouter }    from './_base';

/** 项目模块 */
import { indexPageCtrl } from '../controllers';


pageRouter.get('/',
  (...args) => indexPageCtrl.run('index', ...args));

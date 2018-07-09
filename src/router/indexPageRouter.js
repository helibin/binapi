/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { pageRouter }    from './base';

/** 项目模块 */
import { indexPageCtrl } from '../controller';


pageRouter.get('/',
  (...args) => indexPageCtrl.run('index', ...args));

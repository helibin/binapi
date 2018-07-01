/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import { templatesAPICtrl } from '../controllers';
import { router }           from './_base';


router.get('/templates', templatesAPICtrl.listTemplates);

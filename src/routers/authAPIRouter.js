/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import Ctrl from '../controllers/authAPICtrl';
import router from './_base';

router.post('/auth/sign-in', Ctrl.signIn);

export default router;

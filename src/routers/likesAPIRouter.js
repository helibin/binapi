
/** 项目模块 */
import Ctrl from '../controllers';
import router from './_base';

router.get('/likes', Ctrl.likeCtrl.list);

router.post('/likes', Ctrl.likeCtrl.add);

export default router;

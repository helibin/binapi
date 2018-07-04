/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { router } from './_base';

/** 项目模块 */


router.get('/index',
  async (ctx) => {
    ctx.body = [{
      name: 'sdw',
      sex : 'f',
    }, {
      name: '2rsa',
      sex : 'm',
    }];
  });

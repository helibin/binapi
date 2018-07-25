/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 11:27:47
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */


export default new class extends Base {
  setVersion(version) {
    return async (ctx, next) => {
      ctx.set('x-api-version', version);
      await next();
    };
  }

  setCors() {
    return { expose: ['Date'] };
  }
}();

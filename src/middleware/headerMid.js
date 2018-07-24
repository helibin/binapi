/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-24 15:40:32
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
    return {
      origin: (req) => {
        if (this.CONFIG.apiServer.corsWhiteList === '*') return true;
        return this.CONFIG.apiServer.corsWhiteList.includes(req.header.origin)
          ? req.header.origin
          : false;
      },
      expose: ['Date'],
    };
  }
}();

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 15:55:47
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */


const M = {};

M.setVersion = version => (ctx, next) => {
  ctx.set('x-api-version', version);
  next();
};

export default M;

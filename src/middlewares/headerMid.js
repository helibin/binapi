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

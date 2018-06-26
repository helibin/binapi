/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */

const M = {};

M.prepareUserInfo = async (ctx, next) => {
  await next();
};

export default M;

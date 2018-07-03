/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */

const M = {};

M.prepareUserInfo = async (ctx, next) => {
  await next();
};


/**
 * 是否需要登录
 *
 * @param {string} allowAuthType 允许认证类型
 * @returns {*} null
 */
M.requireSignIn = allowAuthType => async (ctx, next) => {
  await next();
};

export default M;

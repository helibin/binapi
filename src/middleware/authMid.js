
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { _e, PRIVILEGE } from '../helper';

/** 项目模块 */

const M = {};

M.prepareUserInfo = async (ctx, next) => {
  ctx.state.user = {};
  await next();
};


/**
 * 是否需要登录
 *
 * @param {string} allowAuthType 允许认证类型
 * @returns {*} null
 */
M.requireSignIn = allowAuthType => async (ctx, next) => {
  if (!ctx.state.user) throw new _e('EUserNotSignedIn', 'userNotSignedIn');
  await next();
};

M.requirePrivilege = privilege => async (ctx, next) => {
  const userPrivilege = ctx.state.user.privilege || '';
  if (userPrivilege.trim() === '*') await next();

  const privilegeArr = userPrivilege.replace(' ', '').split(',');
  if (!privilegeArr.includes('usersEntry')) {
    throw new _e('EUserAuth', 'noSuchPrivilege', { privilege });
  }

  await next();
};

export default M;

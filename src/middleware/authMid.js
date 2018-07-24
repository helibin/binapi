/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-24 14:21:43
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */

export default new class extends Base {
  async prepareUserInfo(ctx, next) {
    ctx.state.user = {};
    await next();
  }


  /**
   * 是否需要登录
   *
   * @param {string} allowAuthType 允许认证类型
   * @returns {*} null
   */
  requireSignIn() {
    return async (ctx, next) => {
      if (this.t.isEmpty(ctx.state.user)) throw new this._e('EUserNotSignedIn', 'userNotSignedIn');
      await next();
    };
  }

  requirePrivilege(privilege) {
    return async (ctx, next) => {
      const userPrivilege = ctx.state.user.privilege || '';
      if (userPrivilege.trim() === '*') await next();

      const privilegeArr = userPrivilege.replace(' ', '').split(',');
      if (!privilegeArr.includes('usersEntry')) {
        throw new this._e('EUserAuth', 'noSuchPrivilege', { privilege });
      }

      await next();
    };
  }
}();

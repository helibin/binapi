/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-24 20:08:52
 */
/** 内建模块 */

/** 第三方模块 */
import jwt from 'jsonwebtoken';

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authAPICtrl } from '../controller';
import { usersMod } from '../model';


export default new class extends Base {
  prepareUserInfo() {
    return async (ctx, next) => {
      ctx.state.user = {};

      if (this.t.isEmpty(ctx.state.xAuthToken)) {
        ctx.state.logger('info', `请求来着匿名用户：${ctx.state.clientId}`);
        return next();
      }

      // 验证JWT并存储相关数据
      const xAuthTokenInfo = jwt.verify(ctx.state.xAuthToken, this.CONFIG.webServer.secret);
      ctx.state.userId       = xAuthTokenInfo.uid || null;
      ctx.state.authType     = xAuthTokenInfo.authType;
      const xAuthTokenCacheKey = await authAPICtrl.createAuthCacheKey(
        xAuthTokenInfo.uid,
        xAuthTokenInfo.xatId,
      );

      // 服务器端验证xAuthToken
      const redisRes = await ctx.state.redis.get(xAuthTokenCacheKey);
      if (this.t.isEmpty(redisRes)) {
        if (this.CONFIG.webServer.xAuthCookie) {
          ctx.cookies.set(xAuthTokenCacheKey, null);
        }

        throw new this._e('EUserNotSignedIn', 'xAuthTokenExpired', { xAuthTokenCacheKey });
      }

      // 刷新xAuthToken, 如支持Cookie，同时刷新Cookie
      if (ctx.state.authType === 'web' && this.CONFIG.webServer.xAuthCookie) {
        ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, redisRes, {
          signed : true,
          expires: new Date(Date.now() + this.CONFIG.webServer.xAuthMaxAge * 1000),
        });
      }
      await ctx.state.redis.run('expire', xAuthTokenCacheKey, this.CONFIG.webServer.xAuthMaxAge);

      // 服务端获取完整用户信息并覆盖
      if (this.t.isEmpty(ctx.state.userId)) return await next();
      const opt = { id: ctx.state.userId };
      const dbRes = await usersMod.findOne(opt);
      if (this.t.isEmpty(dbRes)) {
        if (this.CONFIG.webServer.xAuthCookie) ctx.cookies.set(this.CONFIG.webServer.xAuthCookie, null);
        throw new this._e('EUser', 'noSuchUser', { userId: ctx.state.userId });
      }

      ctx.state.user = dbRes;

      // 记录最后访问时间
      const nextData = { lastSeenTime: (new Date()).toISOString() };
      await usersMod.update(nextData, { where: { id: ctx.state.userId } });

      ctx.state.logger('info', `请求来自用户: userId=${ctx.state.userId}`);
      await next();
    };
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

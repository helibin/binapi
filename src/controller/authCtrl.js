/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-29 22:30:49
 */
/** 内建模块 */

/** 第三方模块 */
import jwt from 'jsonwebtoken';

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authMod, usersMod } from '../model';


export default new class extends Base  {
  async createAuthCacheKey(userId = '*', xAuthTokenId = '*') {
    return `token@xAuthToken#:userId=${userId}:xAuthTokenId=${xAuthTokenId}`;
  }

  /**
   *
   * @param {object} ctx 上下文
   * @param {string} userId 用户ID
   * @param {string} type=[authUser] 用户类型
   * @returns {string} xAuthToken
   */
  async genXAuthToken(ctx, userId, type = 'authUser') {
    const xatId = `xat_${this.t.genUUID()}`;
    const authType = type.slice(-2).toUpperCase() === 'AK' ? 'AK' : 'web';
    const xAuthTokenInfo = {
      uid: userId,
      authType,
      xatId,
    };

    const xAuthTokenCacheKey = await this.createAuthCacheKey(userId, xatId);
    const xAuthToken         = jwt.sign(xAuthTokenInfo, this.CONFIG.webServer.secret);
    await ctx.state.redis.set(xAuthTokenCacheKey, xAuthToken, this.CONFIG.webServer.xAuthMaxAge);

    return xAuthToken;
  }

  async signIn(ctx) {
    const body = ctx.request.body;
    const opt = {
      attributes: { exclude: ['seq'] },
      where     : {
        $or: {
          user_id   : body.identifier,
          identifier: body.identifier,
        },
      },
    };
    const authRes = await authMod.createGetModFunc(ctx, opt);

    if (this.t.isEmpty(authRes)) {
      throw new this._e('EUserAuth', 'noSuchUser', { identifier: body.identifier });
    }
    if (authRes.password !== this.t.getSaltedHashStr(body.password, authRes.user_id)) {
      throw new this._e('EUserAuth', 'invildUsenameOrPassowrd');
    }

    const userRes = await usersMod.createGetModFunc(ctx, { where: { id: authRes.user_id } });
    if (this.t.isEmpty(userRes)) {
      throw new this._e('EUser', 'noSuchUser', { userId: authRes.user_id });
    }

    userRes.username = body.identifier;
    this.ret.data            = userRes;
    this.ret.xAuthToken = await this.genXAuthToken(ctx, authRes.user_id);

    ctx.state.logger('debug', `用户登录: userId=${authRes.user_id}`);
    ctx.state.sendJSON(this.ret);
  }

  async signUp(ctx) {
    const body      = ctx.request.body;
    const ret       = this.t.initRet();
    const newUserId = this.t.genUUID();

    const newData = {
      id        : newUserId,
      identifier: body.identifier,
      password  : this.t.getSaltedHashStr(body.password, newUserId),
      nickname  : body.nickname || this.t.getDateStr(),
      name      : body.name,
      mobile    : body.mobile,
      email     : body.email,
    };
    await usersMod.run(ctx, 'addUser', newData);

    ctx.state.logger('debug', `用户注册：userId=${newUserId}`);
    ret.data = { newDataId: newUserId };
    ctx.state.sendJSON(ret);
  }
}();

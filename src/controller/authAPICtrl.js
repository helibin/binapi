/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 22:56:45
 */
/** 内建模块 */

/** 第三方模块 */
import jwt from 'jsonwebtoken';

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authMod } from '../model';


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
    const authInfo = await authMod.get('user_id', body.identifier);

    if (this.t.isEmpty(authInfo)) {
      throw new this._e('EUser', 'noSuchUser', { identifier: body.identifier });
    }
    if (authInfo.password !== this.t.getSaltedHashStr(body.password, authInfo.user_id)) {
      throw new this._e('EUserAuth', 'invildUsenameOrPassowrd');
    }

    authInfo.password   = undefined;
    this.ret.data            = authInfo;
    this.ret.xAuthToken = await this.genXAuthToken(ctx, authInfo.user_id);

    ctx.state.logger('debug', `用户登录: userId=${authInfo.user_id}`);
    ctx.state.sendJSON(this.ret);
  }

  async signUp(ctx) {
    const body      = ctx.request.body;
    const ret       = this.t.initRet();
    const newUserId = this.t.genUUID();

    const dbCheck = await authMod.findOne({
      where: {
        $or: {
          user_id   : body.identifier,
          identifier: body.identifier,
        },
      },
    });
    if (dbCheck) throw new this._e('EUser', 'userIsExisted', { identifier: body.identifier });

    const newData = {
      user_id   : newUserId,
      identifier: body.identifier,
      password  : this.t.getSaltedHashStr(body.password, newUserId),
    };
    await authMod.create(newData).catch(async (err) => {
      err = new this._e('EDBMysql', err.message);
      ctx.state.logger(err, ctx.url, err, '\n\n', newData);
      throw err;
    });

    ctx.state.logger('debug', `用户注册：userId=${newUserId}`);
    ret.data = { newDataId: newUserId };
    ctx.state.sendJSON(ret);
  }
}();

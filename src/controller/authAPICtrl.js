/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authMod } from '../model';


export default new class extends Base  {
  async signIn(ctx) {
    const ret = this.t.initRet();

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
    const authInfo = await authMod.findOne(opt);

    if (!authInfo) {
      throw new this._e('EUser', 'noSuchUser', { identifier: body.identifier });
    }
    if (authInfo.password !== this.t.getSaltedHashStr(body.password, authInfo.user_id)) {
      throw new this._e('EUserAuth', 'invildUsenameOrPassowrd');
    }

    authInfo.password = undefined;
    ret.data = authInfo;

    ctx.state.logger('debug', `用户登录: userId=${authInfo.userId}`);
    ctx.state.sendJSON(ret);
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

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './_base';

/** 项目模块 */
import { authMod } from '../models';


export default new class extends Base  {
  async signIn(ctx) {
    const ret = this.t.initRet();

    const body = ctx.request.body;
    const opt = {
      attributes: { exclude: ['seq'] },
      where     : {
        $or: {
          userId    : body.identifier,
          identifier: body.identifier,
        },
      },
    };
    const authInfo = await authMod.findOne(opt);

    if (!authInfo) {
      throw new this._e('EClientNotFound', 'noSuchUser', { identifier: body.identifier });
    }
    if (authInfo.passwordHash !== this.t.getSaltedHashStr(body.password, authInfo.userId)) {
      throw new this._e('EUserAuth', 'invildUsenameOrPassowrd');
    }

    authInfo.passwordHash = undefined;

    ret.data = authInfo;

    ctx.state.logger('debug', `用户登录: userId=${authInfo.userId}`);
    ctx.state.sendJSON(ret);
  }

  async signUp(ctx) {
    const body      = ctx.request.body;
    const ret       = this.t.initRet();
    const newUserId = this.t.genUUID();
    const now       = Date.now();

    const dbCheck = await authMod.findOne({
      where: {
        $or: {
          userId    : body.identifier,
          identifier: body.identifier,
        },
      },
    });
    if (dbCheck) throw new this._e('EUser', 'userIsExisted', { identifier: body.identifier });

    const newData = {
      userId      : newUserId,
      identifier  : body.identifier,
      passwordHash: this.t.getSaltedHashStr(body.password, newUserId),
      createdAt   : now,
      updatedAt   : now,
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

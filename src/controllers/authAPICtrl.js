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
      attributes: { exclude: ['passwordHash'] },
      where     : {
        $or: {
          userId    : body.identifier,
          identifier: body.identifier,
        },
      },
    };
    const userInfo = await authMod.findOne(opt);

    if (!userInfo) {
      throw new this._e('EClientNotFound', 'noSuchUser', { identifier: body.identifier });
    }

    if (userInfo.passwordHash === this.t.getSaltedPasswordHash(body.password, userInfo.userId)) {
      ret.data = userInfo;
    } else {
      throw new this._e('EUserAuth', 'invildUsenameOrPassowrd');
    }

    ctx.state.logger('debug', `用户登录: userId=${userInfo.userId}`);
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
    // if (dbCheck) throw new this._e('EUser', 'userIsExisted', { identifier: body.identifier });

    const newData = {
      userId      : newUserId,
      identifier  : body.identifier,
      passwordHash: this.t.getSaltedHashStr(body.password, newUserId),
      createdAt   : now,
      updatedAt   : now,
    };
    await authMod.create(newData).catch((err) => {
      throw new this._e('EDBMysql', err.message);
    });

    ctx.state.logger('debug', `用户注册：userId=${newUserId}`);
    ret.data = { newDataId: newUserId };
    ctx.state.sendJSON(ret);
  }
}();

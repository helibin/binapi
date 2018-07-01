/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from '../base_modules/tools';
import _e from '../base_modules/serverError';

/** 项目模块 */
import { authMod } from '../models';
import Base from './_base';


export default new class M extends Base  {
  async signIn(ctx) {
    const ret = t.initRet();

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
    try {
      const userInfo = await authMod.findOne(opt);

      if (!userInfo) {
        throw new _e('EUser', 'noSuchUser', { identifier: body.identifier });
      }

      if (userInfo.passwordHash === t.getSaltedPasswordHash(body.password, userInfo.userId)) {
        ret.data = userInfo;
      } else {
        throw new _e('EUserAuth', 'invildUsenameOrPassowrd');
      }

      ctx.state.sendJSON(ret);
    } catch (e) {
      throw e;
    }
  }
}();

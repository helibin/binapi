/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import * as t from '../base_modules/tools';
import _e from '../base_modules/serverError';

/** 项目模块 */
import authMod from '../models/authMod';


const AuthAPICtrl = {};

AuthAPICtrl.signIn = async (ctx) => {
  let ret = t.initRet();

  const body = ctx.request.body;
  const opt = {
    attributes: { exclude: ['passwordHash'] },
    where: {
      $or: {
        userId: body.identifier,
        identifier: body.identifier,
      },
    },
  };
  try {
    const userInfo = await authMod.findOne(opt);

    if (!userInfo) {
      ret = new _e('EUser', 'noSuchUser', { identifier: body.identifier });
      // ret.toJSON()
    }

    if (userInfo.passwordHash === t.getSaltedPasswordHash(body.password, userInfo.userId)) {
      ret.data = userInfo;
    } else {
      ret = new _e('EUserAuth', 'invildUsenameOrPassowrd');
    }
  } catch (e) {
    ret = e;
  }
  ctx.body = ret;
};

export default AuthAPICtrl;

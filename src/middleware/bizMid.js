/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 20:42:56
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authMod, usersMod } from '../model';

/** 项目模块 */

export default new class extends Base {
  commonExists(model, dataIdPosition, dataField = 'id', assertExisted = true, errorMsg) {
    return async (ctx, next) => {
      try {
        let dataId = ctx.params.targetId;
        if (dataIdPosition) {
          dataId = this.t.jsonFind(ctx, dataIdPosition, true);
        }
        const dbCheck = await model.findAll({ where: { [dataField]: dataId } });

        if (dbCheck.length && assertExisted === false) {
          throw new this._e('EClientDuplicated', errorMsg || 'dataDuplicated', { userId: dataId });
        }
        if (!dbCheck.length && assertExisted === true) {
          throw new this._e('EClientNotFound', errorMsg || 'noSuchUser', { userId: dataId });
        }
        await next();
      } catch (err) {
        throw err;
      }
    };
  }

  userExists(dataIdPostion) {
    return this.commonExists(usersMod.model, dataIdPostion);
  }

  async userNotExists(ctx, dataIdPosition, next) {
    let dataId = ctx.params.targetId;
    if (dataIdPosition) {
      dataId = this.t.jsonFind(ctx, dataIdPosition, true);
    }
    const authCheck = await authMod.model.findOne({ where: { identifier: dataId } });

    if (authCheck) throw new this._e('EBizRuleCondition', 'userIsExisted', { userId: authCheck.user_id });
    return await next();
  }
}();

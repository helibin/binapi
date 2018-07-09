/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import { _e } from '../helper';

/** 项目模块 */
import { authMod } from '../model';


const M = {};

M.commonExists = (model, dataIdPostion, assertExisted = true, errorMsg) => async (ctx, next) => {
  try {
    let dataId = ctx.params.targetId;
    if (dataIdPostion) {
      dataId = 'xxx';
    }
    const dbCheck = await [model].findAll({ where: { id: dataId } });

    if (dbCheck.length && assertExisted === false) throw new _e('EClientDuplicated', errorMsg || 'dataDuplicated');
    if (!dbCheck.length && assertExisted === true) throw new _e('EClientNotFound', errorMsg || 'dataNotFound');
    await next();
  } catch (err) {
    throw err;
  }
};

M.userExists = dataIdPostion => M.commonExists(authMod, dataIdPostion);

export default M;

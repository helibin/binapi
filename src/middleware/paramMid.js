/** 内建模块 */

/** 第三方模块 */
import joi      from 'joi';
import BlueBird from 'bluebird';

/** 基础模块 */
import { CONFIG, _e   } from '../helper';

/** 项目模块 */
import i18n from '../i18n';

/** 初始化 */
BlueBird.promisifyAll(joi);


const M = {};

M.check = (rules, data) => async (ctx, next) => {
  const finallyData = {};

  try {
    if (rules) {
      const { query, params } = ctx;
      const body              = ctx.request.body;
      const target            = Object.assign({}, query, body, params, data);

      await joi.validateAsync(target, rules, {
        language    : i18n[ctx.state.shortLocale].joi,
        abortEarly  : true, // 是否有错就报
        allowUnknown: true, // 是否允许未知参数
      }).catch((err) => {
        if (err.name !== 'ValidationError')  throw err;

        const errData = CONFIG.env === 'production' ? err._object : err;
        throw new _e('EClient', err.details[0].message, errData);
      });
    }
    await next();
  } catch (ex) {
    finallyData.hasError = true;
    finallyData.ex = ex;

    throw ex;
  } finally {
    ctx.state.logger('debug', `参数校验，是否通过：${!finallyData.hasError}`, finallyData.ex || '');
  }
};

export default M;

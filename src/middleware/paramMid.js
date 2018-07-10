/** 内建模块 */

/** 第三方模块 */
import joi from 'joi';

/** 基础模块 */
import { CONFIG, _e } from '../helper';

/** 项目模块 */
import i18n from '../i18n';


const M = {};

M.check = (rules, data) => async (ctx, next) => {
  if (rules) {
    const { query, params } = ctx;
    const body              = ctx.request.body;
    const target            = Object.assign({}, query, body, params, data);

    const { error } = joi.validate(target, rules,
      { language: i18n[ctx.state.shortLocale].joi });

    ctx.state.logger('debug', `参数校验，是否通过：${!error}`, error);
    if (error) {
      const errData = CONFIG.env === 'production' ? error._object : error;
      throw new _e('EClient', error.details[0].message, errData);
    }
  }
  await next();
};

export default M;

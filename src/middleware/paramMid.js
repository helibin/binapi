/** 内建模块 */

/** 第三方模块 */
import joi from 'joi';

/** 基础模块 */
import { _e } from '../helper';

/** 项目模块 */


const M = {};

M.check = (rules, data) => async (ctx, next) => {
  if (rules) {
    const { query, params } = ctx;
    const body              = ctx.request.body;
    const target            = Object.assign({}, query, body, params, data);

    const { error } = joi.validate(target, rules);

    if (error) throw new _e('EClient', error.message, error);
  }
  await next();
};

export default M;

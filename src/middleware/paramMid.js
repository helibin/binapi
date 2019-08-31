/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-30 11:45:31
 */
/** 内建模块 */

/** 第三方模块 */
import joi      from 'joi';
import BlueBird from 'bluebird';

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import i18n from '../i18n';

/** 初始化 */
BlueBird.promisifyAll(joi);


export default new class extends Base {
  joiCheck(rules, data) {
    return async (ctx, next) => {
      try {
        if (rules) {
          const { query, params } = ctx;
          const body              = ctx.request.body;
          const target            = Object.assign({}, query, body, params, data);

          await joi.validateAsync(target, rules, {
            language    : i18n[ctx.state.shortLocale].joi,
            abortEarly  : true, // 是否有错就报
            allowUnknown: true, // 是否允许未知参数
          });
        }
      } catch (ex) {
        ctx.state.hasError = true;

        if (ex.name !== 'ValidationError')  throw ex;

        const errData = this.CONFIG.env === 'production' ? ex._object : ex;
        throw new this._e('EClient', ex.details[0].message, errData);
      } finally {
        ctx.state.logger(ctx.state.hasError, `Mid调用 [joiCheck]：参数校验是否通过：${!ctx.state.hasError}`);
      }
      await next();
    };
  }
}();

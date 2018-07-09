/** 内建模块 */

/** 第三方模块 */
import validator from 'validator';

/** 基础模块 */

/** 项目模块 */


export default options => async (ctx, next) => {
  const method = ctx.method.toUpperCase();
  const query = ctx.query;
  const body = ctx.request.body;

  // for (const key in options) {
  //   let validatorFunc = null;
  //   if (options) {
  //     if (method !== 'GET') {
  //       validatorFunc = body[key];
  //     } else {
  //       validatorFunc = query[key];
  //     }
  //   }
  //   validator(validatorFunc);
  // }

  await next();
};

/** 内建模块 */

/** 第三方模块 */
import joi from 'joi';

/** 基础模块 */

/** 项目模块 */


export default {
  signIn: {
    identifier: joi.string().required(),
    password  : joi.string().length(32).required(),
  },
};

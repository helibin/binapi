/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 10:46:15
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi';

/** 基础模块 */

/** 项目模块 */


export default {
  signIn: joi.object().keys({
    identifier: joi.string().required(),
    password  : joi.string().length(32).required(),
  }),

  signUp: joi.object().keys({
    identifier: joi.string().required(),
    password  : joi.string().length(32).required(),
    nickname  : joi.string(),
    name      : joi.string().required(),
    mobile    : joi.string().regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/),
    email     : joi.string().email(),
  }),
};

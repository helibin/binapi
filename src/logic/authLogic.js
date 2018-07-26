/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 19:18:35
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
    phone     : joi.string(),
    email     : joi.string().email(),
  }),
};

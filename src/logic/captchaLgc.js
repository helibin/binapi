/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 15:55:47
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi';

/** 基础模块 */

/** 项目模块 */


export default {
  getSVGCaptcha: joi.object().keys({
    token: joi.string()
      .empty()
      .invalid('\'\'')
      .min(6)
      .max(128)
      .required(),
  }),
};

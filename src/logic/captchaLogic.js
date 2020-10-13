/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:55:27
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */
import { CONST } from '../helper'

/** 项目模块 */

module.exports = {
  getCaptcha: joi.object().keys({
    query: {
      captcha_token: joi
        .string()
        .empty()
        .invalid("''")
        .min(6)
        .max(128)
        .required(),
      cate: joi
        .string()
        .valid(Object.keys(CONST.captchaType))
        .required(),
    },
  }),

  getSmsCode: joi.object().keys({
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    cate: joi
      .string()
      .valid(Object.keys(CONST.smsCodeType))
      .required(),
  }),
}

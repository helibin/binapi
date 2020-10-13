/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:55:14
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */
import { CONFIG, CONST } from '../helper'

/** 项目模块 */

module.exports = {
  signIn: joi.object().keys({
    identifier: joi.string().required(),
    password: joi
      .string()
      .length(32)
      .required(),
    captcha_token: CONFIG.webServer.skipAuthCaptcha
      ? joi.any()
      : joi
          .string()
          .empty()
          .invalid("''")
          .min(6)
          .max(128)
          .required(),
    captcha: CONFIG.webServer.skipAuthCaptcha
      ? joi.any()
      : joi
          .string()
          .length(4)
          .required(),
  }),

  signUp: joi.object().keys({
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    code: CONFIG.webServer.skipAuthSmsCode ? joi.string() : joi.string().required(),
    password: joi
      .string()
      .length(32)
      .required(),
    name: joi.string().max(10),
    gender: joi.string().valid(Object.keys(CONST.gender)),
    email: joi.string().email(),
    address: joi.string(),
    height: joi.string(),
    weight: joi.string(),
    birthday: joi.string(),
    captcha_token: CONFIG.webServer.skipAuthCaptcha
      ? joi.any()
      : joi
          .string()
          .empty()
          .invalid("''")
          .min(6)
          .max(128)
          .required(),
    captcha: CONFIG.webServer.skipAuthCaptcha
      ? joi.any()
      : joi
          .string()
          .length(4)
          .required(),
  }),

  getCaptcha: joi.object().keys({
    query: {
      captcha_token: joi
        .string()
        .empty()
        .invalid("''")
        .min(6)
        .max(128)
        .required(),
    },
  }),

  getSmsCode: joi.object().keys({
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
  }),

  resetPassword: {
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    code: joi.string().required(),
    password: joi
      .string()
      .length(32)
      .required(),
  },

  smsSignIn: joi.object().keys({
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    code: joi.string().required(),
  }),
}

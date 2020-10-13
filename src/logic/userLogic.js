/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-04 09:55:38
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */
import { CONST } from '../helper'

/** 项目模块 */

module.exports = {
  modify: {
    hospital_id: joi
      .string()
      .length(32)
      .allow('xu_sa'),
    name: joi.string().max(10),
    gender: joi.string().valid(Object.keys(CONST.gender)),
    email: joi.string().email(),
    address: joi.string(),
    birthday: joi.date().iso(),
    height: joi.number().precision(2),
    weight: joi.number().precision(2),
    extra_info: joi.object(),
    baby_id: joi
      .string()
      .length(32)
      .allow('xu_sa'),
  },

  upload: {
    file: joi
      .object({
        name: joi.string().required(),
        type: joi
          .string()
          .valid(Object.values(CONST.mimeType.image))
          .required(),
        size: joi
          .number()
          .max(100 * 1024 * 1024)
          .required(), // 5M
      })
      .required(),
  },
  download: {
    query: {
      w: joi
        .number()
        .positive()
        .integer(),
    },
    params: {
      targetId: joi
        .string()
        .length(32)
        .allow('xu_sa')
        .required(),
      filename: joi.string().required(),
    },
  },
  getSmsCode: {
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
  },
  verifyMobile: {
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    code: joi
      .string()
      .length(6)
      .required(),
  },
  bindMobile: {
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
    code: joi
      .string()
      .length(6)
      .required(),
  },

  listInvites: {
    query: {
      by_page: joi.string(),
      page: joi.string(),
      psize: joi.string(),
    },
  },

  invite: {
    baby_id: joi
      .string()
      .length(32)
      .required(),
    phone: joi
      .string()
      .regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/)
      .required(),
  },

  modifyInvite: {
    status: joi
      .string()
      .valid(['agreed', 'refused'])
      .required(),
  },
}

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 21:41:01
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */
import { CONST } from '../helper/yamlCC'

/** 项目模块 */

module.exports = {
  list: {
    query: {
      page: joi.string(),
      psize: joi.string(),
    },
  },
  add: {
    identifier: joi
      .string()
      .min(2)
      .required(),
    password: joi.string().length(32),
    name: joi.string().max(10),
    phone: joi.string().regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/),
    email: joi.string().email(),
    type: joi.string().valid(Object.keys(CONST.muserType)),
  },
  get: {
    params: {
      targetId: joi
        .string()
        .length(32)
        .allow('xu_sa')
        .required(),
    },
  },
  modify: {
    params: {
      targetId: joi
        .string()
        .length(32)
        .allow('xu_sa')
        .required(),
    },
    name: joi.string().max(10),
    phone: joi.string().regex(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/),
    email: joi.string().email(),
    type: joi.string().valid(Object.keys(CONST.muserType)),
    is_disabled: joi
      .boolean()
      .truthy(1, '1')
      .falsy(0, '0'),
  },
  setDisable: {
    params: {
      targetId: joi
        .string()
        .length(32)
        .allow('xu_sa')
        .required(),
    },
    is_disabled: joi
      .boolean()
      .truthy(1, '1')
      .falsy(0, '0')
      .required(),
  },
  delete: {
    params: {
      targetId: joi
        .string()
        .length(32)
        .allow('xu_sa')
        .required(),
    },
  },
}

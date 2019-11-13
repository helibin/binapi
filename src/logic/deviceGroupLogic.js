/*
 * @Author: helibin@139.com
 * @Date: 2018-10-31 20:11:24
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 15:14:35
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */

/** 项目模块 */

module.exports = {
  query: {
    query: {
      page: joi.string(),
      psize: joi.string(),
      id: joi.string().length(32),
    },
  },

  add: joi.object().keys({
    name: joi
      .string()
      .min(4)
      .max(128)
      .required(),
  }),

  modify: joi.object().keys({
    params: {
      targetId: joi
        .string()
        .length(32)
        .required(),
    },
    name: joi.string().max(128),
    remark: joi.string().allow(''),
  }),

  setDisable: {
    params: {
      targetId: joi
        .string()
        .length(32)
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
        .required(),
    },
  },
}

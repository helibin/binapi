/*
 * @Author: helibin@139.com
 * @Date: 2018-11-01 18:02:07
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-07 21:38:04
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'

/** 基础模块 */

/** 项目模块 */

module.exports = {
  modify: {
    old_password: joi
      .string()
      .length(32)
      .required(),
    new_password: joi
      .string()
      .length(32)
      .required(),
  },
}

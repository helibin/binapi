/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-11 11:03:02
 */
/** 内建模块 */

/** 第三方模块 */
import joi from 'joi'
import BlueBird from 'bluebird'

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import i18n from '../i18n'

/** 初始化 */
BlueBird.promisifyAll(joi)

module.exports = new (class extends Base {
  joiCheck(rules, data) {
    return async (ctx, next) => {
      try {
        if (rules) {
          const query = ctx.query
          const params = ctx.params
          const body = ctx.request.body
          const files = ctx.request.files
          const target = { ...query, ...params, ...body, ...files, ...data }

          ctx.state.logger(
            'debug',
            '参数校验: ',
            `规则参数: ${Object.keys(rules)}, `,
            `校验目标: ${this.t.jsonStringify(target)}`,
          )
          await joi.validateAsync(target, rules, {
            language: i18n[ctx.state.shortLocale].joi,
            abortEarly: true, // 是否有错就报
            allowUnknown: !rules.__strict, // 是否允许未知参数
          })
        }
      } catch (ex) {
        ctx.state.hasError = true

        if (ex.name !== 'ValidationError') throw ex

        const errData = ['prod', 'qa'].includes(process.env.NODE_ENV) ? ex._object : ex
        throw new this.ce('invalidParam', ex.details[0].message, errData)
      } finally {
        ctx.state.logger(ctx.state.hasError, `Mid调用 [joiCheck]：参数校验是否通过：${!ctx.state.hasError}`)
      }
      await next()
    }
  }
})()

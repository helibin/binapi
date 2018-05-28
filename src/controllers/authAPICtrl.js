'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'
import _e from '../base_modules/serverError'

/** 项目模块 */
import authMod from '../models/authMod'

export const signIn = async (ctx, next) => {
  let ret = t.initRet()

  let body = ctx.request.body
  let opt = {
    attributes: {
      exclude: ['passwordHash']
    },
    where: {
      $or: {
        userId: body.identifier,
        identifier: body.identifier
      }
    }
  }
  try {
    let userInfo = await authMod.findOne(opt)

    if (!userInfo) {
      ret = new _e('EUser', 'noSuchUser', {
        identifier: body.identifier
      })
      // ret.toJSON()
    }

    if (userInfo.passwordHash === t.getSaltedPasswordHash(body.password, userInfo.userId)) {
      ret.data = userInfo
    } else {
      ret = new _e('EUserAuth', 'invildUsenameOrPassowrd')
    }
  } catch (e) {
    ret = e
  }
  ctx.body = ret
}

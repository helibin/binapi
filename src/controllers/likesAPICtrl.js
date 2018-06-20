'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'
import _e from '../base_modules/serverError'

/** 项目模块 */
import likesMod from '../models/likesMod'



export const listLikes = async (ctx) => {
  let ret = t.initRet();

  let opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit: ctx.state.pageSetting.pageSize,
  }
  try {
    let result = await likesMod.findAndCountAll(opt)

    ret = t.genPageInfo(ctx, result.rows)
  } catch (e) {
    throw e
    ctx.state.logger('error', 'listLikes', e);
  }
  ctx.state.sendJSON(ret)
}


export const addLike = async (ctx) => {
  let ret = t.initRet();

  let newData = {
    id: t.genUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  Object.assign(newData, ctx.request.body)
  try {
    let like = await likesMod.findOne({
      where: {
        $or: {
          nickname: ctx.request.body.nickname,
        }
      }
    })

    if (like) {
      await likesMod.update({
        updatedAt: Date.now()
      }, {
        where: {
          nickname: ctx.request.body.nickname,
        }
      })
    } else {
      await likesMod.create(newData)

      ret.data = {
        newDataId: newData.id
      }
    }
  } catch (e) {
    ret = e;
  }

  ctx.body = ret;
}

'use strict'

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'

/** 项目模块 */
import usersMod from '../models/usersMod'



export const listUsers = async(ctx) => {
  let ret = t.initRet();

  let opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit: ctx.state.pageSetting.pageSize,
  }
  try {
    let result = await usersMod.findAndCountAll(opt)
    ret.data = result.rows

    ret.pageInfo = t.genPageInfo(ctx, result)
  } catch (e) {
    ret = e;
  }
  ctx.body = ret
}

export const getUser = async(ctx) => {
  let ret = t.initRet();

  let opt = {
    where: {
      id: ctx.params.targetId
    }
  }

  try {
    ret.data = await usersMod.findOne(opt)
  } catch (e) {
    ret = e;
  }
  ctx.body = ret
}

export const addUser = async(ctx) => {
  let ret = t.initRet();

  let newData = {
    id: t.genUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  Object.assign(newData, ctx.request.body)
  try {
    await usersMod.create(newData)
  } catch (e) {
    ret = e;
  }

  ret.data = {
    newDataId: newData.id
  }
  ctx.body = ret;
}

export const modifyUser = async(ctx) => {
  let ret = t.initRet();

  let targetId = ctx.params.targetId
  let nextData = {
    updatedAt: Date.now(),
  }
  Object.assign(nextData, ctx.request.body)

  let opt = {
    where: {
      id: targetId
    }
  }

  try {
    await usersMod.update(data, opt)
  } catch (e) {
    ret = e;
  }

  ctx.body = ret;
}

export const deleteUser = async(ctx) => {
  let ret = t.initRet();

  let opt = {
    where: {
      id: ctx.params.targetId
    }
  }

  try {
    await usersMod.destroy(opt)
  } catch (e) {
    ret = e;
  }

  ctx.body = ret;
}

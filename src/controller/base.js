/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-12-09 17:24:57
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'

/** 基础模块 */
import { CONFIG, T, YamlCC, ce } from '../helper'

/** 项目模块 */
import Mod from '../model'

/** 预处理 */

export default class {
  constructor() {
    this.CONFIG = CONFIG
    this.CONST = YamlCC.CONST
    this.ce = ce
    this.t = T
  }

  run(func, modelName, actionMsg, ...args) {
    return async ctx => {
      const now = Date.now()
      try {
        // 匿名访问

        if (this.t.isEmpty(func)) return ctx.state.sendJSON()

        if (typeof this[func] === 'function') {
          return await this[func](ctx, modelName, ...args)
        }

        throw new ce('eWebServer', `\`${func}\`IsNotFunction`)
      } catch (ex) {
        ctx.state.hasError = true
        throw ex
      } finally {
        ctx.state.logger(
          ctx.state.hasError,
          `Ctrl调用方法: [${chalk.magenta(func)}], `,
          `响应: ${ctx.state.hasError ? '异常' : '正常'},`,
          chalk.green(`用时: ${Date.now() - now}ms`),
        )
      }
    }
  }

  async queryCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const model = `${modelName}Mod`
    const { id } = ctx.query

    ret.data = await Mod[model][id ? 'get' : 'list'](ctx, ctx.state.userId ? { id, user_id: ctx.state.userId } : id)
    if (id && this.t.isEmpty(ret.data)) throw new this.ce('noSuchResource', { data_id: id })

    ctx.state.logger('debug', `获取${modelName}`)
    ctx.state.sendJSON(ret)
  }

  async listCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const model = `${modelName}Mod`

    ret.data = await Mod[model].list(ctx, ctx.state.userId ? { user_id: ctx.state.userId } : null)

    ctx.state.logger('debug', `列出${modelName}`)
    ctx.state.sendJSON(ret)
  }

  async getCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const model = `${modelName}Mod`

    ret.data = await Mod[model].get(ctx, ctx.state.userId ? { id: targetId, user_id: ctx.state.userId } : targetId)

    ctx.state.logger('debug', `获取${modelName}: targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }

  async addCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const newData = ctx.request.body
    const newId = this.t.genUUID()
    const model = `${modelName}Mod`

    newData.id = newId

    await Mod[model].add(ctx, newData)
    ret.data = { new_id: newId }

    ctx.state.logger('debug', `新增${modelName}: id=${newId}`, newData)
    ctx.state.sendJSON(ret)
  }

  async modifyCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const nextData = ctx.request.body
    const model = `${modelName}Mod`

    await Mod[model].modify(ctx, targetId, nextData)

    ctx.state.logger('debug', `修改${modelName}: targetId=${targetId}`, nextData)
    ctx.state.sendJSON(ret)
  }

  async setDisableCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const is_disabled = ctx.request.body.is_disabled
    const model = `${modelName}Mod`

    await Mod[model].modify(ctx, targetId, { is_disabled })

    ctx.state.logger('debug', `修改${modelName}: targetId=${targetId}`, { is_disabled })
    ctx.state.sendJSON(ret)
  }

  async deleteCommon(ctx, modelName) {
    const ret = this.t.initRet()
    const targetId = ctx.params.targetId
    const model = `${modelName}Mod`

    await Mod[model].delete(ctx, targetId)

    ctx.state.logger('debug', `删除${modelName}: targetId=${targetId}`)
    ctx.state.sendJSON(ret)
  }
}

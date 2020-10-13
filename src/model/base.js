/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2020-03-16 09:40:36
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk'

/** 基础模块 */
import { CONFIG, Mysql, T, ce } from '../helper'

/** 项目模块 */

export default class {
  constructor() {
    this.CONFIG = CONFIG
    this.ce = ce
    this.sequelize = Mysql.sequelize
    this.t = T
  }

  async run(ctx, func, ...args) {
    const now = Date.now()
    ctx.state.hasError = false
    try {
      if (typeof this[func] === 'function') {
        return await this[func](ctx, ...args)
      }

      if (typeof this.sequelize[func] === 'function') {
        return await this.sequelize[func](...args)
      }

      if (typeof this.model[func] === 'function') {
        return await this.model[func](...args)
      }

      throw new this.ce('eMysql', `[${func}]IsNotFunction`)
    } catch (ex) {
      ctx.state.hasError = true
      if (!this.t.isEmpty(ctx.state.trans)) {
        await ctx.state.trans.rollback()
      }

      if (ex instanceof ce) {
        throw ex
      } else {
        ctx.state.logger(ex, 'eMysql.run', ex)
        throw new this.ce('eMysql', ex.message && ex.message.toString())
      }
    } finally {
      // 提交事务
      if (!this.t.isEmpty(ctx.state.trans) && !ctx.state.hasError) {
        await ctx.state.trans.commit()
      }

      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用方法：[${chalk.magenta(func)}], `,
        `是否开启事务：${!!ctx.state},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用方法：[${chalk.magenta(func)}], `,
        `详情: ${this.t.jsonStringify(args)}`,
      )
      ctx.state.trans = null
    }
  }

  async baseQuery(ctx, sql, extraOpt) {
    extraOpt = extraOpt || {}
    ctx.state.hasError = false
    const now = Date.now()
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      // 分页处理
      if (extraOpt.byPage === undefined) extraOpt.byPage = ctx.state.byPage
      if (extraOpt.byPage) {
        let [{ dbCount }] = await this.sequelize.query(`SELECT COUNT(1) dbCount FROM (${this.t.strf(sql, 1)}) t`, {
          type: 'SELECT',
          ...extraOpt,
        })
        this.dbCount = dbCount
        sql += `
          LIMIT :offset, :limit
        `
        extraOpt.replacements = extraOpt.replacements || {}
        extraOpt.replacements.offset = ctx.state.pageSetting.pageStart
        extraOpt.replacements.limit = ctx.state.pageSetting.pageSize
      }

      const dbRes = await this.sequelize.query(sql, {
        type: this.sequelize.QueryTypes.SELECT,
        transaction,
        ...extraOpt,
      })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return extraOpt.byPage ? this.t.formatPageInfo(ctx, this.dbCount, dbRes) : dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用LIST方法, 是否开启事务：false, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        `是否分页：${!!extraOpt.paging}, `,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用sqlQuery方法, `,
        `详情: ${this.t.jsonStringify(extraOpt)}`,
      )
    }
  }

  async baseList(ctx, whereOpt, extraOpt) {
    whereOpt = this.t.jsonFormat(whereOpt || ctx.query)
    extraOpt = extraOpt || {}

    extraOpt.raw = extraOpt.raw !== false

    // 分页处理
    if (extraOpt.paging === undefined) extraOpt.paging = ctx.state.paging
    if (extraOpt.paging) {
      extraOpt = {
        ...extraOpt,
        offset: ctx.state.pageSetting.pageStart,
        limit: ctx.state.pageSetting.psize,
      }
    }

    // 模糊搜索
    extraOpt.q = extraOpt.q || ctx.query.q
    if (!this.t.isEmpty(extraOpt.q) && extraOpt.qFields) {
      const qOpt = { $like: `%${extraOpt.q}%` }
      whereOpt.$or = {}
      for (const f of extraOpt.qFields) {
        if (['seq', 'password'].includes(f)) continue

        whereOpt.$or[f] = qOpt
      }
    }

    // 过滤where条件
    for (const w in whereOpt) {
      if ([...Object.keys(this.model.rawAttributes), '$or'].includes(w) && typeof whereOpt[w] !== 'undefined') continue

      delete whereOpt[w]
    }

    // 默认排查字段
    extraOpt.attributes = extraOpt.attributes || { exclude: ['seq', 'creator_id', 'editor_id', 'password'] }

    const dbRes = await this.model[extraOpt.paging ? 'findAndCountAll' : 'findAll']({
      where: whereOpt,
      order: [['created_at', 'DESC']],
      ...extraOpt,
    }).catch(async ex => {
      ctx.state.logger(ex, 'eMysql.baseList', ex)
      throw new this.ce('eMysql', ex.message && ex.message.toString())
    })

    return extraOpt.paging ? this.t.formatPageInfo(ctx, dbRes.count, dbRes.rows) : dbRes
  }

  async list(ctx, whereOpt, extraOpt) {
    whereOpt = this.t.jsonFormat(whereOpt || ctx.query)
    extraOpt = extraOpt || {}
    ctx.state.hasError = false
    const now = Date.now()
    try {
      return await this.baseList(ctx, whereOpt, extraOpt)
    } catch (ex) {
      ctx.state.hasError = true

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用LIST方法, 是否开启事务：false, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        `是否分页：${!!extraOpt.paging}, `,
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用LIST方法, `,
        `详情: ${this.t.jsonStringify(whereOpt)}`,
      )
    }
  }

  async baseGet(ctx, whereOpt, extraOpt) {
    whereOpt = typeof whereOpt === 'object' ? this.t.jsonFormat(whereOpt) : { id: whereOpt }
    extraOpt = extraOpt || {}

    // 默认排查字段
    extraOpt.attributes = extraOpt.attributes || { exclude: ['seq', 'creator_id', 'editor_id', 'password'] }

    extraOpt.raw = extraOpt.raw !== false
    const dbRes = await this.model
      .findOne({
        where: whereOpt,
        ...extraOpt,
      })
      .catch(async ex => {
        ctx.state.logger(ex, 'eMysql.baseGet', ex)
        throw new this.ce('eMysql', ex.message && ex.message.toString())
      })

    return dbRes || {}
  }

  async get(ctx, whereOpt, extraOpt) {
    whereOpt = typeof whereOpt === 'object' ? this.t.jsonFormat(whereOpt) : { id: whereOpt }
    extraOpt = extraOpt || {}
    ctx.state.hasError = false
    const now = Date.now()

    try {
      return await this.baseGet(ctx, whereOpt, extraOpt)
    } catch (ex) {
      ctx.state.hasError = true

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用GET方法, 是否开启事务：false, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用GET方法, `,
        `whereOpt=${this.t.jsonStringify(whereOpt)}`,
      )
    }
  }

  async add(ctx, newData, extraOpt) {
    const now = Date.now()
    ctx.state.hasError = false
    newData = this.t.jsonFormat(newData)
    extraOpt = extraOpt || {}
    const targetData = newData
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      if (this.t.isEmpty(targetData)) return [1]

      targetData.creator_id = targetData.creator_id || ctx.state.userId
      const dbRes = await this.model
        .create(targetData, {
          transaction,
          ...extraOpt,
        })
        .catch(async ex => {
          ctx.state.logger(ex, 'eMysql.add', ex)
          throw new this.ce('eMysql', ex.message.toString())
        })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用ADD方法, 是否开启事务：true, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用ADD方法, `,
        `data: ${this.t.jsonStringify(targetData)}`,
      )
    }
  }

  async batchAdd(ctx, newDataList, extraOpt) {
    const now = Date.now()
    ctx.state.hasError = false
    newDataList = this.t.jsonFormat(newDataList)
    extraOpt = extraOpt || {}
    const targetDataList = newDataList
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      Array.from(targetDataList, d => {
        d.creator_id = d.creator_id || ctx.state.userId
        return d
      })
      const dbRes = await this.model
        .bulkCreate(targetDataList, {
          transaction,
          ignoreDuplicates: true,
          ...extraOpt,
        })
        .catch(async ex => {
          ctx.state.logger(ex, 'eMysql.batchAdd', ex)
          throw new this.ce('eMysql', ex.message.toString())
        })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用批量ADD方法, 是否开启事务：true,`,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用批量ADD方法, `,
        `data: ${this.t.jsonStringify(targetDataList)}`,
      )
    }
  }

  async modify(ctx, whereOpt, nextData, extraOpt) {
    const now = Date.now()
    ctx.state.hasError = false
    whereOpt = typeof whereOpt === 'object' ? this.t.jsonFormat(whereOpt) : { id: whereOpt }
    nextData = this.t.jsonFormat(nextData)
    extraOpt = extraOpt || {}
    const targetData = nextData
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      if (this.t.isEmpty(targetData)) return [1]

      targetData.editor_id = targetData.editor_id || ctx.state.userId
      const dbRes = await this.model
        .update(targetData, {
          where: whereOpt,
          ...extraOpt,
          transaction,
        })
        .catch(async ex => {
          ctx.state.logger(ex, 'eMysql.modify', ex)
          throw new this.ce('eMysql', ex.message.toString())
        })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用MODIFY方法, 是否开启事务：true, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用MODIFY方法, `,
        `whereOpt=${this.t.jsonStringify(whereOpt)}, `,
        `data: ${this.t.jsonStringify(targetData)}`,
      )
    }
  }

  async delete(ctx, whereOpt, extraOpt) {
    const now = Date.now()
    ctx.state.hasError = false
    whereOpt = typeof whereOpt === 'object' ? this.t.jsonFormat(whereOpt) : { id: whereOpt }
    extraOpt = extraOpt || {}
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      const dbRes = await this.model
        .destroy({
          where: whereOpt,
          transaction,
          ...extraOpt,
        })
        .catch(async ex => {
          ctx.state.logger(ex, 'eMysql.delete', ex)
          throw new this.ce('eMysql', ex.message.toString())
        })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用DELETE方法, 是否开启事务：true, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用DELETE方法, `,
        `whereOpt=${this.t.jsonStringify(whereOpt)}`,
      )
    }
  }

  async count(ctx, whereOpt, extraOpt) {
    const now = Date.now()
    ctx.state.hasError = false
    whereOpt = typeof whereOpt === 'object' ? this.t.jsonFormat(whereOpt) : { id: whereOpt }
    extraOpt = extraOpt || {}
    const transaction = extraOpt.transaction || (await this.sequelize.transaction())

    try {
      const dbRes = await this.model
        .count({
          where: whereOpt,
          transaction,
          ...extraOpt,
        })
        .catch(async ex => {
          ctx.state.logger(ex, 'eMysql.count', ex)
          throw new this.ce('eMysql', ex.message.toString())
        })

      if (this.t.isEmpty(extraOpt.transaction)) await transaction.commit()

      return dbRes
    } catch (ex) {
      ctx.state.hasError = true
      await transaction.rollback()
      ctx.state.trans = null

      throw ex
    } finally {
      ctx.state.logger(
        ctx.state.hasError,
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用COUNT方法, 是否开启事务：true, `,
        this.t.isEmpty(extraOpt.transaction) ? `结果：${ctx.state.hasError ? '失败' : '成功'}, ` : '',
        chalk.green(`用时：${Date.now() - now}ms`),
      )
      ctx.state.logger(
        'debug',
        `Mod<${(this.model && this.model.name) || 'unknown'}>调用通用COUNT方法, `,
        `whereOpt=${this.t.jsonStringify(whereOpt)}`,
      )
    }
  }
}

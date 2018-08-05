/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-05 11:40:29
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, _e, mysql, t,
} from '../helper';

/** 项目模块 */

export default class {
  constructor() {
    this.CONFIG = CONFIG;
    this._e     = _e;
    this.sequelize  = mysql.sequelize;
    this.ret    = t.initRet();
    this.t      = t;
  }

  async run(ctx, func, ...args) {
    const now = Date.now();
    try {
      let dbRes = null;

      if (typeof this[func] !== 'function') {
        dbRes = await this.sequelize[func](...args).catch(async (ex) => {
          throw new this._e('EDBMysql', ex.message.toString());
        });
      }

      dbRes = await this[func](ctx, ...args)
        .catch(async (ex) => {
          throw new this._e('EDBMysql', ex.message.toString());
        });

      return dbRes ? dbRes.toJSON() : dbRes;
    } catch (ex) {
      ctx.state.hasError = true;
      if (!this.t.isEmpty(this.trans)) await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Model调用方法：[${func}]，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Model调用方法：[${func}]，详情: ${JSON.stringify(...args)}`);
    }
  }

  async list(ctx, whereOpt, extraOpt = {}) {
    const now = Date.now();
    try {
      const dbRes = await this.model
        .findAndCountAll(Object.assign({ where: whereOpt }, extraOpt, { raw: true }))
        .catch(async (err) => {
          throw new this._e('EDBMysql', err.message);
        });

      return this.t.genPageInfo(ctx, dbRes.rows, extraOpt.page, extraOpt.pageSize);
    } catch (ex) {
      ctx.state.hasError = true;

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用LIST方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用LIST方法，详情: ${JSON.stringify(whereOpt)}`);
    }
  }

  async get(ctx, whereOpt, extraOpt = {}) {
    const now = Date.now();
    try {
      const dbRes = await this.model
        .findOne(Object.assign({ where: whereOpt }, extraOpt, { raw: true }))
        .catch(async (err) => {
          throw new this._e('EDBMysql', err.message);
        });

      return dbRes;
    } catch (ex) {
      ctx.state.hasError = true;

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用GET方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用GET方法，详情: ${JSON.stringify(whereOpt)}`);
    }
  }

  async add(ctx, newData, extraOpt = {}) {
    const now = Date.now();
    try {
      this.trans = await this.sequelize.transaction();

      const dbRes = await this.model
        .create(newData, Object.assign(extraOpt, { transaction: this.trans }))
        .catch(async (err) => {
          throw new this._e('EDBMysql', err.message);
        });

      await this.trans.commit();
      return dbRes;
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用ADD方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用ADD方法，data: ${JSON.stringify(newData)}`);
    }
  }

  async batchAdd(ctx, newDataList, extraOpt = {}) {
    const now = Date.now();
    try {
      this.trans = await this.sequelize.transaction();

      const dbRes = await this.model
        .bulkCreate(newDataList, Object.assign(extraOpt, { transaction: this.trans }))
        .catch(async (err) => {
          throw new this._e('EDBMysql', err.message);
        });

      await this.trans.commit();
      return dbRes;
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用批量ADD方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用批量ADD方法，data: ${JSON.stringify(newDataList)}`);
    }
  }

  async modify(ctx, data, whereOpt, extraOpt) {
    const now = Date.now();
    try {
      this.trans = await this.sequelize.transaction();

      const dbRes = await this.model
        .update(data, Object.assign({ where: whereOpt }, extraOpt, { transaction: this.trans }))
        .catch(async (err) => {
          throw new this._e('EDBMysql', err.message);
        });

      await this.trans.commit();
      return dbRes;
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用MODIFY方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用MODIFY方法，data: ${JSON.stringify(data)}, options: ${JSON.stringify(whereOpt)}`);
    }
  }

  async delete(ctx, whereOpt) {
    const now = Date.now();
    try {
      this.trans = this.sequelize.transaction();

      const dbRes = await this.model.destroy({ where: whereOpt }).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });

      await this.trans.commit();
      return dbRes;
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用DELETE方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
      ctx.state.logger('debug', `Mod调用通用DELETE方法，options: ${JSON.stringify(whereOpt)}`);
    }
  }
}

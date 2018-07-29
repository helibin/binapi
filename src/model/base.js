/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-29 23:35:46
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

      dbRes = await this[func](ctx, ...args).catch(async (ex) => {
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
    }
  }

  async createListModFunc(ctx, options) {
    const now = Date.now();
    try {
      const dbRes = await this.model.findAll(options).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });
      return dbRes ? dbRes.toJSON() : dbRes;
    } catch (ex) {
      ctx.state.hasError = true;

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用LIST方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }

  async createGetModFunc(ctx, options) {
    const now = Date.now();
    try {
      const dbRes = await this.model.findOne(options).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });

      return dbRes ? dbRes.toJSON() : dbRes;
    } catch (ex) {
      ctx.state.hasError = true;

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用GET方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }

  async createAddModFunc(ctx, data) {
    const now = Date.now();
    try {
      this.trans = await this.sequelize.transaction();

      await this.model.create(data, { transaction: this.trans }).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });

      return await this.trans.commit();
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用ADD方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }

  async createModifiyModFunc(ctx, data, options) {
    const now = Date.now();
    try {
      this.trans = await this.sequelize.transaction();

      await this.model.update(data, options).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });

      return await this.trans.commit();
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用MODIFY方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }

  async createDeleteModFunc(ctx, options) {
    const now = Date.now();
    try {
      this.trans = this.sequelize.transaction();

      await this.model.destroy(options).catch(async (err) => {
        throw new this._e('EDBMysql', err.message);
      });

      return await this.trans.commit();
    } catch (ex) {
      ctx.state.hasError = true;
      await this.trans.rollback();

      throw ex;
    } finally {
      ctx.state.logger(ctx.state.hasError,
        `Mod调用通用DELETE方法，是否开启事务：${!!this.trans},`,
        `结果：${ctx.state.hasError ? '失败' : '成功'},`,
        `用时：${Date.now() - now}ms。`);
    }
  }
}

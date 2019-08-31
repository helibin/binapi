/*
 * @Author: helibin@139.com
 * @Date: 2018-07-25 22:53:31
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-30 14:59:12
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { sequelize } from '../helper/mysqlHelper';


export default new class extends Base {
  async init(ctx) {
    const force = ctx.query.force;
    const cacheKey = this.t.genCacheKey('database', 'init', true);
    let syncTime = await ctx.state.redis.get(cacheKey);

    sequelize.sync({ force: !!force });

    if (force) {
      syncTime = new Date().toLocaleString();
      await ctx.state.redis.set(cacheKey, syncTime);
      this.ret.msg = 'databaseInited';
    }
    this.ret.data = { syncTime };

    ctx.state.logger('info', '数据库同步成功');
    await ctx.state.sendJSON(this.ret);
  }
}();

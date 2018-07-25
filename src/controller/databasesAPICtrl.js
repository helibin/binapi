/*
 * @Author: helibin@139.com
 * @Date: 2018-07-25 22:53:31
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 23:47:16
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import * as schemes from '../schema';


export default new class extends Base {
  async init(ctx) {
    const force = ctx.query.force;
    const cacheKey = this.t.genCacheKey('database', 'init', true);
    let syncTime = await ctx.state.redis.get(cacheKey);
    if (!force && !this.t.isEmpty(syncTime)) {
      ctx.state.logger('info', `数据库已同步：${syncTime}`);
      this.ret.data = { syncTime };

      return await ctx.state.sendJSON(this.ret);
    }

    for (const schema of Object.values(schemes)) {
      if (typeof schema === 'function') {
        schema.sync({ force: true });
      }
    }

    syncTime = new Date().toLocaleString();
    await ctx.state.redis.set(cacheKey, syncTime);
    this.ret.data = { syncTime };

    ctx.state.logger('info', '数据库同步成功');
    await ctx.state.sendJSON(this.ret);
  }
}();

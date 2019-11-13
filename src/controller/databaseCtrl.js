/*
 * @Author: helibin@139.com
 * @Date: 2018-07-25 22:53:31
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-13 20:29:50
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */
import Mysql from '../helper/mysqlHelper'
import Scm from '../schema'

module.exports = new (class extends Base {
  async init(ctx) {
    const ret = this.t.initRet()
    const force = ctx.query.force
    const update = ctx.query.update
    const schema = ctx.query.schema
    const cacheKey = this.t.genCacheKey('database', 'init', true)
    let syncTime = await ctx.state.redis.get(cacheKey)

    if (this.t.isEmpty(schema)) {
      await Mysql.sequelize.sync({ force: !!force, alter: !!update })
    } else {
      await Scm[schema].sync({ force: !!force, alter: !!update })
    }

    if (force) {
      await ctx.state.redis.set(cacheKey, syncTime)
      ret.msg = 'databaseInited'
    } else if (update) {
      syncTime = new Date().toLocaleString()
      await ctx.state.redis.set(cacheKey, syncTime)
      ret.msg = 'databaseUpdated'
    }
    ret.data = { sync_time: syncTime }

    ctx.state.logger('info', '数据库同步成功')
    await ctx.state.sendJSON(ret)
  }
})()

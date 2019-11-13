/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-12-21 16:49:54
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base'

/** 项目模块 */

module.exports = new (class extends Base {
  async baseQuery(ctx, sql, extraOpt) {
    extraOpt = extraOpt || {}

    extraOpt = Object.assign({ type: this.sequelize.QueryTypes.SELECT }, extraOpt)
    return await this.sequelize.query(sql, extraOpt)
  }
})()

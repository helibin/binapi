/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-20 22:31:38
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import Base from './base'

module.exports = new (class extends Base {
  async index(ctx) {
    const pageData = { body: 'index', title: 'Bin API', prefix: CONFIG.webServer.prefix || '' }
    await ctx.state.render('index', pageData)
  }

  async apidoc(ctx) {
    await ctx.state.redirect(`${CONFIG.webServer.prefix || ''}/apidoc/index.html`)
  }

  async mapidoc(ctx) {
    await ctx.state.redirect(`${CONFIG.webServer.prefix || ''}/mapidoc/index.html`)
  }
})()

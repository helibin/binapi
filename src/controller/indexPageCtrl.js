/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2019-11-01 09:42:04
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import Base from './base'

module.exports = new (class extends Base {
  async index(ctx) {
    const pageData = { body: 'index', title: 'Bin API' }
    await ctx.state.render('index', pageData)
  }

  async apidoc(ctx) {
    await ctx.state.redirect('/apidoc/index.html')
  }

  async mapidoc(ctx) {
    await ctx.state.redirect('/mapidoc/index.html')
  }
})()

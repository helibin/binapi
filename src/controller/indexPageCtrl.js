/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-18 19:34:46
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import Base from './base';


export default new class extends Base {
  async index(ctx) {
    this.pageData = { body: 'index', title: 'Bin API' };
    await ctx.state.render('index', this.pageData);
  }

  async apidoc(ctx) {
    await ctx.state.redirect('/apidoc/index.html');
  }

  async apidocInternal(ctx) {
    await ctx.state.redirect('/apidoc-internal/index.html');
  }
}();

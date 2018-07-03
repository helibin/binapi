/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import Base from './_base';


export default new class extends Base {
  async index(ctx) {
    this.pageData = { body: 'index', title: 'Bin API' };
    await ctx.state.render('index', this.pageData);
  }
}();

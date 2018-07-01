/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */
import Base from './_base';


export default new class M extends Base {
  async index(ctx) {
    await ctx.state.render('index', { body: 'index' });
  }
}();

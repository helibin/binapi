/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */


const M = {};

M.index = async (ctx) => {
  await ctx.state.render('index', { body: 'index' });
};

export default M;

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from '../base_modules/tools';

/** 项目模块 */
import templatesMod from '../models/templatesMod';


const M = {};

M.listTemplates = async (ctx) => {
  let ret = t.initRet();

  const opt = {
    offset: ctx.state.pageSetting.pageStart,
    limit : ctx.state.pageSetting.pageSize,
  };

  try {
    const result = await templatesMod.findAndCountAll(opt);
    ret.data = result.rows;

    ret.pageInfo = t.genPageInfo(ctx, result);
  } catch (e) {
    ret = e;
  }
  ctx.body = ret;
};

export default M;

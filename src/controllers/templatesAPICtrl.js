/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './_base';

/** 项目模块 */
import { templatesMod } from '../models';


export default new class extends Base {
  async listTemplates(ctx) {
    let ret = this.t.initRet();

    const opt = {
      offset: ctx.state.pageSetting.pageStart,
      limit : ctx.state.pageSetting.pageSize,
    };

    try {
      const result = await templatesMod.findAndCountAll(opt);
      ret.data = result.rows;

      ret.pageInfo = this.t.genPageInfo(ctx, result);
    } catch (e) {
      ret = e;
    }
    ctx.body = ret;
  }
}();

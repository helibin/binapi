/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 15:55:47
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { templatesMod } from '../model';


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

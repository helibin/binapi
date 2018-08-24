/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:13:57
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-24 15:57:36
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */


export default new class extends Base {
  async checkToken(ctx) {
    const query = ctx.request.query;
    this.ret.data = query;

    ctx.state.sendJSON(this.ret);
  }
}();

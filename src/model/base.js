/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 22:57:19
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, _e, mysql, t,
} from '../helper';

/** 项目模块 */


export default class {
  constructor() {
    this.CONFIG = CONFIG;
    this._e     = _e;
    this.mysql  = mysql;
    this.t      = t;
  }

  async run(ctx, func, ...args) {
    try {
      return await this[func](ctx, ...args);
    } catch (ex) {
      ctx.state.logger(ex, `Model调用方法：[${func}]时触发异常。`);
      throw ex;
    }
  }

  async get(field, target) {
    try {
      this.ret.data = await this.findOne({ [field]: target });
      return this.ret;
    } catch (ex) {
      throw ex;
    }
  }
}

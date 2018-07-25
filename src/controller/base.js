/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-25 23:36:29
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, t, _e,
} from '../helper';

/** 项目模块 */


export default class {
  constructor() {
    this.CONFIG = CONFIG;
    this._e     = _e;
    this.ret    = t.initRet();
    this.t      = t;
  }

  run(func, ...args) {
    return async (ctx) => {
      try {
        await this[func](ctx, ...args);
      } catch (ex) {
        ctx.state.logger(ex, `Ctrl调用方法：[${func}]时触发异常。`);
        throw ex;
      }
    };
  }
}

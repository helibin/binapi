/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 20:31:15
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
    this.t      = t;
  }

  run(func, ...args) {
    return async (ctx, next) => {
      try {
        await this[func](ctx, ...args, next);
      } catch (ex) {
        ctx.state.hasError = true;
        throw ex;
      } finally {
        ctx.state.logger(ctx.state.hasError,
          `Mid调用方法：[${func}] ${ctx.state.hasError ? '失败' : '成功'}。`);
      }
    };
  }
}

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-30 11:46:26
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, _e, t,
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
      const now = Date.now();
      try {
        await this[func](ctx, ...args);
      } catch (ex) {
        ctx.state.hasError = true;
        throw ex;
      } finally {
        ctx.state.logger(ctx.state.hasError,
          `Ctrl调用方法：[${func}],`,
          `响应：${ctx.state.hasError ? '异常' : '正常'},`,
          `用时：${Date.now() - now}ms。`);
      }
    };
  }
}

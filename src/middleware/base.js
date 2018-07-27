/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 14:42:24
 */
/** 内建模块 */

/** 第三方模块 */
import sleep from 'sleep';

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
      const now = Date.now();
      try {
        await this[func](ctx, ...args);
        sleep.msleep(109);
      } catch (ex) {
        ctx.state.hasError = true;
        throw ex;
      } finally {
        ctx.state.logger(ctx.state.hasError,
          `Mid调用方法：[${func}] ${ctx.state.hasError ? '终止' : '通过'},`,
          `用时：${Date.now() - now}ms。`);
      }
      return await next();
    };
  }
}

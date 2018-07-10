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

  run(func) {
    return async (ctx, next) => {
      try {
        await this[func](ctx, next);
      } catch (err) {
        throw err;
      }
    };
  }
}

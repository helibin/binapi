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
    this.name = 'nana';
  }

  async run(func, ctx, next) {
    try {
      await this[func](ctx, next);
    } catch (err) {
      throw err;
    }
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.hypot(dx, dy);
  }
}

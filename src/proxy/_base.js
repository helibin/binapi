/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import {
  CONFIG, t, _e,
} from '../helpers';

/** 项目模块 */


export default class {
  constructor() {
    this.CONFIG = CONFIG;
    this._e = _e;
    this.t = t;
  }

  async run(func, ctx, next) {
    try {
      await this[func](ctx, next);
    } catch (err) {
      if (err.name !== '_myError') {
        ctx.state.logger(err, err);
        throw new this._e('EDBMysql', err.message);
      }
      throw err;
    }
  }
}

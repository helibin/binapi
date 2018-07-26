/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-26 18:54:16
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */
import { authScm } from '../schema';


export default new class extends Base {
  constructor() {
    super();
    this.model = authScm;
  }

  async get(ctx, options) {
    options = options || { user_id: null };

    return await authScm.findOne(options);
  }
}();

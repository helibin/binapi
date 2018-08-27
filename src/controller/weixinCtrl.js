/*
 * @Author: helibin@139.com
 * @Date: 2018-08-23 15:13:57
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-27 14:47:13
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import CONFIG from 'config';
import Base from './base';

/** 项目模块 */


export default new class extends Base {
  async checkSign(ctx) {
    const query = ctx.request.query;
    this.ret.data = query;

    const signStr = [CONFIG.weixinServer.secret, query.timestamp, query.nonce].sort().join('');
    const sign = this.t.getSha1(signStr);

    if (sign !== query.signature) throw new this._e('EWeixinAPI', 'checkSignFailed');

    ctx.body = query.echostr;
  }
}();

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */


export default new class extends Base {
  async test(ctx) {
    // console.log(await t.getIPInfoByTaobao(ctx, '1.82.64.124'), 'getLocation,,,');
    const randStr = this.t.genRandStrs(10, '342121lkdsaf');
    const err = new this._e('EClientNotFound', 'xxx', { randStr });
    await this.t.getIPInfo(ctx.ip);

    // const data = await si.osInfo()
    // console.log(data)
    // console.time('math');
    // console.log(this.t.eval('0.3 / 0.1 + 0.6 + 4 - 5 / 3 + 1234556'),
    //   typeof this.t.eval('0.3 / 0.1'), ',,,');
    // console.timeEnd('math');
    // new Error('error from outside')
    // next(new _e('xxx', 'xxx', {
    //   randStr: randStr
    // }))
    // ctx.state.sendJSON(err);
    throw err;
  }

  async location(ctx) {
    const ip = ctx.query.ip;
    const location = (await this.t.getLocationByIP(ip)) || {};

    ctx.state.sendJSON(location);
  }
}();

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-16 15:43:30
 */
/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import Base from './base';

/** 项目模块 */


export default new class extends Base {
  async test(ctx) {
    // console.log(await t.getIPInfoByTaobao(ctx, '1.82.64.124'), 'getLocation,,,');

    // const randStr = this.t.genRandStr(10, '342121lkdsaf');
    // this.ret = new this._e('EClientNotFound', 'xxx', { randStr });

    // await this.t.getIPInfo(ctx.ip);

    // this.ret.data = await ctx.state.aly.upload('static/img/test.png', new Buffer('1334'));
    // this.ret.data = await ctx.state.aly.download('static/img/test.png');

    // this.ret.data = await ctx.state.alySMS.sendSMS('15179316184');
    // this.ret.data = await ctx.state.alySMS.queryDetail('15179316184');

    // this.ret.data = await ctx.state.aly.genAlyCoupon(1440093726226429, 'sdfl');

    this.ret.data = await ctx.state.aly.getSessionInfo('IXmR33*jvWD3ixtnr2wJJFCgEn9N1ykcSf_ENpoU_BOTwChTBoNM1ZJeedfK9zxYnbN5hossqIZCr6t7SGxRigm2Cb4fGaCdBZWIzmgdHq6sXXZQg4KFWufyvpeV*0*Cm58slMT1tJw3_k$$zcwPEWSE0');

    // this.ret = await ctx.state.subMailer.queryDetail('15179316184');
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
    ctx.state.sendJSON(this.ret);
    // throw err;
  }

  async location(ctx) {
    const ip = ctx.query.ip;
    const location = (await this.t.getLocationByIP(ip)) || {};

    ctx.state.sendJSON(location);
  }
}();
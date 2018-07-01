/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */
import t from '../base_modules/tools';
import _e from '../base_modules/serverError';

/** 项目模块 */


const M = {};

M.test = async (ctx, next) => {
  try {
    // console.log(await t.getIPInfoByTaobao(ctx, '1.82.64.124'), 'getLocation,,,');
    const randStr = t.genRandStr(10, '342121lkdsaf');
    const err = new _e('xxx', 'xxx', { randStr });
    // await t.getIPInfo(ctx);
    console.log(await t.getOSInfo());

    // const data = await si.osInfo()
    // console.log(data)
    console.time('math');
    console.log(t.eval('0.3 / 0.1 + 0.6 + 4 - 5 / 3 + 1234556'), typeof t.eval('0.3 / 0.1'), ',,,');
    console.timeEnd('math');
    // new Error('error from outside')
    // next(new _e('xxx', 'xxx', {
    //   randStr: randStr
    // }))
    ctx.state.sendJSON(err);
  } catch (e) {
    ctx.state.logger('error', e, ',,,');
    next(e);
  }
};

M.location = async (ctx, next) => {
  try {
    const ip = ctx.query.ip;
    const location = (await t.getLocationByIP(ip)) || {};

    ctx.state.sendJSON(location);
  } catch (e) {
    ctx.state.logger('error', e, ',,,');
    next(e);
  }
};

export default M;

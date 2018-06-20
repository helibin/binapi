'use strict';

/** 内建模块 */
import path from 'path'

/** 第三方模块 */
import np from 'number-precision'

/** 基础模块 */
import CONFIG from 'config'
import t from '../base_modules/tools'
import _e from '../base_modules/serverError'

/** 项目模块 */



export const test = async (ctx, next) => {
  try {
    t.getLocation(ctx)
    let randStr = t.genRandStr(10, '342121lkdsaf')
    ctx.state.logger('debug', randStr, ',,,');
    let err = new _e('xxx', 'xxx', {
      randStr: randStr
    });
    await t.getIPInfo(ctx)
    // console.log(err.toJSON(), ',,,');
    // new Error('error from outside')
    // next(new _e('xxx', 'xxx', {
    //   randStr: randStr
    // }))
    ctx.state.sendJSON(err)
  } catch (e) {
    ctx.state.logger('debug', e, ',,,');
    throw e;
  }
}

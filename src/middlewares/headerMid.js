'use strict';

/** 内建模块 */

/** 第三方模块 */

/** 基础模块 */

/** 项目模块 */



let api = module.exports = {};

api.setVersion = (version) => {
  return (ctx, next) => {
    ctx.set('x-api-version', version)
    next()
  }
}

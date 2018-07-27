/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-27 14:48:55
 */
/** 内建模块 */
import fs from 'fs';

/** 第三方模块 */
import svgCaptcha from 'svg-captcha';
import Promise from 'bluebird';

/** 基础模块 */
import Base from './base';


/** 项目模块 */

/** 预处理 */
svgCaptcha.options = {
  width   : 150,
  height  : 60,
  fontSize: 18,
};
Promise.promisifyAll(fs);


export default new class extends Base {
  /**
   * 创建验证码缓存键值
   *
   * @param {string} type 验证码类型
   * @param {string} cate 验证码分类
   * @param {string} clientId 客户端ID
   * @param {string} token 验证码Token
   * @returns {string} 验证码缓存键值
   */
  createCapthaCacheKey(type, cate, clientId, token) {
    return `ccapCaptcha@${cate}#type=${type}:clientId=${clientId}:token=${token}`;
  }

  genCaptchaTest(type = 'svg') {
    return async (ctx, next) => {
      const ret = this.t.initRet();
      const start = Date.now();
      let count = 0;

      switch (type) {
        case 'svg':
          while ((Date.now() - start) < 1000) {
            svgCaptcha.create({
              ignoreChars: '0o1i',
              noise      : 4,
              color      : true,
              background : '#fff',
            });
            count += 1;
          }
          break;
        case 'bmp':
          while ((Date.now() - start) < 1000) {
            svgCaptcha.create({
              ignoreChars: '0o1i',
              noise      : 4,
              color      : true,
              background : '#fff',
            });
            count += 1;
          }
          break;
        default: break;
      }
      ctx.state.logger('1秒内生成验证码：', count);
      ret.data = { count };
      ctx.state.sendJSON(ret);
      await next();
    };
  }

  getSVGCaptcha(cate = 'common') {
    return async (ctx) => {
      const cacheKey = this.createCapthaCacheKey('svg', cate, ctx.state.clientId, ctx.query.captchaToken);

      const captcha = svgCaptcha.create({
        size       : 6,
        ignoreChars: '0o1i',
        noise      : 4,
        color      : true,
        background : '#fff',
      });

      await ctx.state.redis.set(cacheKey,
        captcha.text.toUpperCase(),
        this.CONFIG.webServer.captchaMaxAge.svg);

      ctx.state.sendSVG(captcha.data);
    };
  }

  verifySVGCaptha(type = 'common') {
    return async (ctx, next) => {
      await next();
    };
  }
}();

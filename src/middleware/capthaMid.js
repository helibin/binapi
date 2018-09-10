/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-09-10 17:08:47
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk';
import svgCaptcha from 'svg-captcha';

/** 基础模块 */
import Base from './base';

/** 项目模块 */

/** 预处理 */
const captchaOpt = {
  width      : 150,
  height     : 60,
  fontSize   : 50,
  ignoreChars: '0o1il',
  noise      : 3,
  color      : true,
};


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
    return `captcha@${cate}#type=${type}:clientId=${clientId}:token=${token}`;
  }

  genCaptchaTest() {
    return async (ctx, next) => {
      const ret = this.t.initRet();
      const start = Date.now();
      let count = 0;

      while ((Date.now() - start) < 1000) {
        svgCaptcha.create(captchaOpt);
        count += 1;
      }

      ctx.state.logger('1秒内生成验证码：', count);
      ret.data = { count };
      ctx.state.sendJSON(ret);
      await next();
    };
  }

  genSVGCaptcha(cate = 'common') {
    return async (ctx) => {
      try {
        const cacheKey = this.createCapthaCacheKey('svg',
          cate,
          ctx.state.clientId,
          ctx.query.token);

        const redisRes = await ctx.state.redis.get(cacheKey);
        if (!this.t.isEmpty(redisRes)) {
          try {
            const captcha = JSON.parse(redisRes).data;
            ctx.state.logger('debug',
              chalk.magenta('[缓存]'),
              `生成[${cate}]验证码成功：captcha: ${captcha.text}`);
            return ctx.state.sendSVG(captcha);
          } catch (ex) {
            ctx.state.logger(ex, 'redisParseError');
          }
        }

        const captcha = svgCaptcha.create(captchaOpt);

        await ctx.state.redis.set(cacheKey,
          JSON.stringify(captcha),
          this.CONFIG.webServer.captchaMaxAge.svg);

        ctx.state.logger('debug', `生成[${cate}]验证码成功：captcha: ${captcha.text}`);
        ctx.state.sendSVG(captcha.data);
      } catch (ex) {
        ctx.state.logger(ex, `生成[${cate}]验证码失败`);
        throw ex;
      }
    };
  }

  verifySVGCaptha(cate = 'common') {
    return async (ctx, next) => {
      try {
        if (this.CONFIG.webServer.skipCaptcha) return await next();

        const captchaToken = ctx.request.body.captchaToken;
        const inputCaptcha = ctx.request.body.captcha;
        const cacheKey = this.createCapthaCacheKey('svg',
          cate,
          ctx.state.clientId,
          captchaToken);

        const redisRes = await ctx.state.redis.get(cacheKey);
        if (this.t.isEmpty(redisRes)) {
          throw new this._e('EClientBadRequest', 'captchaTokenNotFound', {
            cate,
            captchaToken,
          });
        }

        let captcha = {};
        try {
          captcha = JSON.parse(redisRes);
        } catch (ex) {
          throw new this._e('EDBRedis', 'redisParseError');
        }

        await ctx.state.redis.del(cacheKey);
        if (captcha.text.toLowerCase() !== inputCaptcha.toLowerCase()) {
          throw new this._e('EBizRuleCaptcha', 'invalidCaptcha', {
            cate,
            captchaToken,
            captchaValue: captcha.text,
            inputCaptcha,
          });
        }
        await ctx.state.redis.del(cacheKey);
      } catch (ex) {
        ctx.state.logger(ex, `校验[${cate}]验证码失败`);
        throw ex;
      }
      await next();
    };
  }
}();

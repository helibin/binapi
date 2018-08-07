/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 15:55:47
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-06 15:00:29
 */
/** 内建模块 */

/** 第三方模块 */
import chalk from 'chalk';
import svgCaptcha from 'svg-captcha';

/** 基础模块 */
import Base from './base';

/** 项目模块 */

/** 预处理 */
svgCaptcha.options = {
  width   : 150,
  height  : 60,
  fontSize: 18,
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

        const captcha = svgCaptcha.create({
          size       : 4,
          ignoreChars: '0o1il',
          noise      : 3,
          color      : true,
          background : '#fff',
        });

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
        try {
          const captcha = JSON.parse(redisRes);
          if (captcha.text.toLowerCase() !== inputCaptcha.toLowerCase()) {
            throw new this._e('EBizRuleCaptcha', 'invalidCaptcha', {
              cate,
              captchaToken,
              captchaValue: captcha.text,
              inputCaptcha,
            });
          }
        } catch (ex) {
          throw new this._e('EDBRedis', 'redisParseError');
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

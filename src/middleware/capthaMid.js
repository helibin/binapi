/** 内建模块 */
import fs from 'fs';

/** 第三方模块 */
import svgCaptcha from 'svg-captcha';
import Promise from 'bluebird';

/** 基础模块 */
import {
  CONFIG, _e, t,
} from '../helper';

/** 项目模块 */

/** 预处理 */
svgCaptcha.options = {
  width   : 150,
  height  : 60,
  fontSize: 18,
};
Promise.promisifyAll(fs);


const M = {};

/**
 * 创建验证码缓存键值
 *
 * @param {string} type 验证码类型
 * @param {string} cate 验证码分类
 * @param {string} clientId 客户端ID
 * @param {string} token 验证码Token
 * @returns {string} 验证码缓存键值
 */
M.createCapthaCacheKey = (type, cate, clientId, token) => `ccapCaptcha@${cate}#type=${type}:clientId=${clientId}:token=${token}`;

M.genCaptchaTest = (type = 'svg') => async (ctx, next) => {
  const ret = t.initRet();
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

M.getSVGCaptcha = (cate = 'common') => async (ctx, next) => {
  const cache = M.createCapthaCacheKey('svg', cate, ctx.state.clientId, ctx.query.captchaToken);

  const captcha = svgCaptcha.create({
    size       : 6,
    ignoreChars: '0o1i',
    noise      : 4,
    color      : true,
    background : '#fff',
  });

  await ctx.state.redis.run('setex', cache, CONFIG.webServer.captchaMaxAge.svg, captcha.text.toUpperCase());
  ctx.state.sendSVG(captcha.data);
  await next();
};

M.verifySVGCaptha = (type = 'common') => async (ctx, next) => {
  await next();
};
export default M;

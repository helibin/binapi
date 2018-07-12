/** 内建模块 */

/** 第三方模块 */
import svgCaptcha from 'svg-captcha';

/** 基础模块 */

/** 项目模块 */


const M = {};

svgCaptcha.options = {
  width   : 150,
  height  : 60,
  fontSize: 18,
};

M.getSVGCaptha = (type = 'common') => async (ctx, next) => {
  const captcha = svgCaptcha.create({
    size       : 4,
    ignoreChars: '0o1i',
    noise      : 4,
    color      : true,
    background : '#fff',
  });
  // ctx.state.redis.run('setex', captcha, type);

  ctx.state.sendSVG(captcha.data);
  await next();
};

M.verifySVGCaptha = (type = 'common') => async (ctx, next) => {
  await next();
};
export default M;

/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:01:45
 * @Last Modified by:   lybeen
 * @Last Modified time: 2018-07-17 19:01:45
 */
export default () => async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache,no-store,must-revalidate');
  ctx.set('Expires', '0');
  ctx.set('Pragma', 'no-cache');

  await next();
};

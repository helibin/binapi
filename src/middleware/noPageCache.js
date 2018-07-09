export default () => async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache,no-store,must-revalidate');
  ctx.set('Expires', '0');
  ctx.set('Pragma', 'no-cache');

  await next();
};

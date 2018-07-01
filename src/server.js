/* 内建模块 */
import path from 'path';

/** 第三方模块 */
import Koa        from 'koa';
import server     from 'koa-static';
import views      from 'koa-views';
import userAgent  from 'koa-useragent';
import bodyparser from 'koa-bodyparser';
import cors       from 'koa-cors';
import chalk      from 'chalk';
import helpers    from 'handlebars-helpers';
import handlebars from  'handlebars';

/* 基础模块 */
import CONFIG from 'config';
import yamlCC from './base_modules/yamlCC';
import logger from './base_modules/logger';
import t      from './base_modules/tools';

/** 项目模块 */
import prepare from './base_modules/prepare';
import authMid from './middlewares/authMid';

/** 路由模块 */
import router from './routers';

const app = new Koa();

// 错误处理
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    switch (ctx.accepts('json', 'html')) {
      case 'html':
        ctx.type = 'html';
        ctx.state.render('404');
        break;
      case 'json':
        ctx.body = t.initRet(404, 'Not Found');
        break;
      default:
        ctx.type = 'text';
        ctx.body = 'Page Not Found';
    }
  }
});

// 静态文件服务器
app.use(server(`${__dirname}/static`));

// handlebars, ejs
app.use(views(path.join(__dirname, '/views'), {
  options: {
    helpers : helpers(),
    partials: CONFIG.hbs.partials,
  },
  extension: 'hbs',
  map      : {
    hbs : 'handlebars',
    html: 'ejs',
  },
}));

// 中间件初始化
app.use(userAgent);
app.use(bodyparser());
app.use(cors({
  origin: (req) => {
    if (CONFIG.webServer.corsWhiteList === '*') return true;
    return CONFIG.webServer.corsWhiteList.includes(req.header.origin) ? req.header.origin : false;
  },
}));

app.use(prepare.response);
app.use(prepare.detectPageSetting);
app.use(authMid.prepareUserInfo);

// 页面禁止缓存
app.use(async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache,no-store,must-revalidate');
  ctx.set('Expires', '0');
  ctx.set('Pragma', 'no-cache');

  await next();
});

app.use(router.routes());

try {
  app.listen(CONFIG.webServer.port, CONFIG.webServer.host, () => {
    /* 服务器运行配置 */

    // console.log(chalk.blue('Hello world!'));
    logger(null, chalk.green('服务器已启动'));
    logger(null, '监听端口  ：', `${chalk.cyan(CONFIG.webServer.port)}`);
    logger(null, '运行环境  ：', `${chalk.cyan(CONFIG.env)}`);

    /* 常量加载检测 */
    yamlCC.check();

    const mysqlExtraConfigs = [];
    for (const k in CONFIG.dbServer.mysql) {
      if (['host', 'port', 'username', 'password', 'database'].includes(k)) continue;

      mysqlExtraConfigs.push(`${k}=${chalk.cyan(CONFIG.dbServer.mysql[k])}`);
    }
    logger(null, 'MySQL     ：', chalk.yellow(`mysql://\
      ${chalk.cyan(CONFIG.dbServer.mysql.username)}@\
      ${chalk.cyan(CONFIG.dbServer.mysql.host)}:\
      ${CONFIG.dbServer.mysql.port}/\
      ${chalk.cyan(CONFIG.dbServer.mysql.database)}?\
      ${mysqlExtraConfigs.join('&')}`.replace(/ {2}/g, '')));

    logger(null, 'Redis     ：', chalk.yellow(`redis://\
      ${chalk.cyan(CONFIG.dbServer.redis.host)}:\
      ${CONFIG.dbServer.redis.port}/\
      ${chalk.cyan(CONFIG.dbServer.redis.db)}`.replace(/ {2}/g, '')));

    /* 服务器安全配置 */
    if (CONFIG.dbServer.mysql.password) {
      logger(null, 'MySQL密码 ：', chalk.green('启用'));
    } else {
      logger(null, 'MySQL密码 ：', chalk.red('禁用'), chalk.magenta('存在安全风险！'));
    }

    if (CONFIG.dbServer.redis.password) {
      logger(null, 'Redis密码 ：', chalk.green('启用'));
    } else {
      logger(null, 'Redis密码 ：', chalk.red('禁用'), chalk.magenta('存在安全风险！'));
    }

    /* 用户认证配置 */
    if (CONFIG.webServer.xAuthHeader) {
      logger(null, 'Header认证：', chalk.yellow(`启用 ${chalk.cyan(CONFIG.webServer.xAuthHeader)}`));
    } else {
      logger(null, 'Header认证：', chalk.white('禁用'));
    }

    if (CONFIG.webServer.xAuthQuery) {
      logger(null, 'Query 认证：', chalk.yellow(`启用 ${chalk.cyan(CONFIG.webServer.xAuthQuery)}`));
    } else {
      logger(null, 'Query 认证：', chalk.white('禁用'));
    }

    if (CONFIG.webServer.xAuthCookie) {
      logger(null, 'Cookie认证：', chalk.yellow(`启用 ${chalk.cyan(CONFIG.webServer.xAuthCookie)}`));
    } else {
      logger(null, 'Cookie认证：', chalk.white('禁用'));
    }

    if (!CONFIG.webServer.xAuthHeader
      && !CONFIG.webServer.xAuthQuery
      && !CONFIG.webServer.xAuthCookie) {
      logger(null, chalk.red('未启用任何认证方式，请检查配置中`webServer.xAuth*`部分'));
      process.exit(1);
    }

    logger(null, chalk.green('Have fun @'),
      chalk.blue(`http://${CONFIG.webServer.host}:${CONFIG.webServer.port}!`));
  });
} catch (ex) {
  logger(null, ex);
  process.exit(1);
}

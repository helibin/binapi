/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:03:53
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-07-19 17:20:31
 */
/* 内建模块 */
import path from 'path';

/** 第三方模块 */
import Koa        from 'koa';
import bodyparser from 'koa-bodyparser';
import chalk      from 'chalk';
import cors       from 'koa-cors';
import ip         from 'ip';
import server     from 'koa-static';
import userAgent  from 'koa-useragent';
import views      from 'koa-views';
import handlebars from 'handlebars';
import helpers    from 'handlebars-helpers';

/* 基础模块 */
import {
  CONFIG, logger, prepare, check,
} from './helper';


/** 项目模块 */
import {
  authMid, errorHandler, noPageCache,
} from './middleware';

/** 路由模块 */
import { pageRouter, router } from './router';


const app = new Koa();

// 错误处理
app.use(errorHandler);

// 静态文件服务器
app.use(server(path.join(__dirname, 'static')));

// handlebars, ejs
app.use(views(path.join(__dirname, 'view'), {
  extension: 'hbs',
  map: {
    hbs : 'handlebars',
    html: 'ejs',
    ejs : 'ejs',
  },
  options: {
    helpers: helpers(),
    partials: {
      'header.base': path.join(__dirname, 'view/layout/header.base.hbs'),
      'header'     : path.join(__dirname, 'view/layout/header.hbs'),
      'footer.base': path.join(__dirname, 'view/layout/footer.base.hbs'),
      'footer'     : path.join(__dirname, 'view/layout/footer.hbs'),
    }
  }
}));

// 通用中间件初始化
app.use(userAgent);
app.use(bodyparser());
app.use(cors({
  origin: (req) => {
    if (CONFIG.apiServer.corsWhiteList === '*') return true;
    return CONFIG.apiServer.corsWhiteList.includes(req.header.origin)
      ? req.header.origin
      : false;
  },
}));

// 业务中间件初始化
app.use(prepare.response);
app.use(prepare.detectPageSetting);
app.use(authMid.prepareUserInfo);
app.use(noPageCache());


// 路由加载
app.use(router.routes());
app.use(pageRouter.routes());

try {
  app.listen(CONFIG.webServer.port, CONFIG.webServer.host, () => {
    /* 服务器运行配置 */

    logger(null, chalk.green('服务器已启动'));
    logger(null, '监听端口  ：', `${chalk.cyan(CONFIG.webServer.port)}`);
    logger(null, '运行环境  ：', `${chalk.cyan(CONFIG.env)}`);

    /* 常量加载检测 */
    check();

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
      chalk.blue(`http://${ip.address()}:${CONFIG.webServer.port}!`));
  });
} catch (ex) {
  logger(null, ex);
  process.exit(1);
}

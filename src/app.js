/*
 * @Author: helibin@139.com
 * @Date: 2018-07-17 19:03:53
 * @Last Modified by: lybeen
 * @Last Modified time: 2018-08-22 15:05:28
 */
/* 内建模块 */
import http from 'http'
import path from 'path';

/** 第三方模块 */
import Koa        from 'koa';
import bodyparser from 'koa-bodyparser';
import chalk      from 'chalk';
import cors       from 'koa-cors';
import ip         from 'ip';
import koaStatic  from 'koa-static';
import userAgent  from 'koa-useragent';
import views      from 'koa-views';
import helpers    from 'handlebars-helpers';
import IO         from 'socket.io';

/* 基础模块 */
import {
  CONFIG, logger, prepare, socket, yamlCheck,
} from './helper';

/** 项目模块 */
import {
  authMid, errorHandler, noPageCache, headerMid, sessionMid,
} from './middleware';
import { ioHelper } from "./socketio";

/** 路由模块 */
import { pageRouter, router } from './router';


const app = new Koa();
app.proxy = true;

app.keys = [CONFIG.webServer.secret];

// 跨域设置
app.use(cors(headerMid.setCors()));

// 静态文件服务器
app.use(koaStatic(path.join(__dirname, 'static')));

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

// 错误处理
app.use(errorHandler);

// 业务中间件初始化
app.use(prepare.response);
app.use(prepare.xAuthToken)
app.use(prepare.detectPageSetting);
app.use(authMid.initUserInfo());
app.use(noPageCache());

// 路由加载
app.use(router.routes());
app.use(pageRouter.routes());

const server = http.createServer(app.callback());

new ioHelper(server).init()

try {
  server.listen(CONFIG.webServer.port, CONFIG.webServer.host, () => {
    /* 服务器运行配置 */

    logger(null, chalk.green('服务器已启动'));
    logger(null, '监听端口  ：', `${chalk.cyan(CONFIG.webServer.port)}`);
    logger(null, '运行环境  ：', `${chalk.cyan(CONFIG.env)}`);

    /* 常量加载检测 */
    yamlCheck();

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

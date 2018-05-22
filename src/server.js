'use strict'

/* 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import Koa from 'koa'
import server from 'koa-static'
import views from 'koa-views'
import userAgent from 'koa-useragent'
import bodyparser from 'koa-bodyparser'
import cors from 'koa-cors'

import colors from 'colors/safe'
import hbs from 'hbs'
import helpers from 'handlebars-helpers'

/* 基础模块 */
import CONFIG from 'config'
import * as t from './baseModules/tools'

/** 项目模块 */
import * as prepare from './baseModules/prepare'
import * as authMid from './middlewares/authMid'

/** 路由模块 */
import indexPageRouter from './routers/indexPageRouter'
import indexAPIRouter from './routers/indexAPIRouter'
import usersAPIRouter from './routers/usersAPIRouter'
import authAPIRouter from './routers/authAPIRouter'
import templatesAPIRouter from './routers/templatesAPIRouter'
import likesAPIRouter from './routers/likesAPIRouter'

const app = new Koa()

//自定义错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.body || err.message
    console.error(ctx.url);
    console.error(err.toString());
    console.error(err.stack + "\n");
  }
})

// 靜態服務器
app.use(server(__dirname + '/static'))

// handlebars, ejs
app.use(views(path.join(__dirname, '/views'), {
  options: {
    helpers: helpers(),
    partials: CONFIG.hbs.partials
  },
  extension: 'hbs',
  map: {
    hbs: 'handlebars',
    html: 'ejs',
  }
}))

// 中间初始化
app.use(userAgent)
app.use(bodyparser())
app.use(cors({
  origin: CONFIG.webServer.corsWhiteList
}))

app.use(prepare.response)
app.use(prepare.detectPageSetting)
app.use(authMid.prepareUserInfo)

// 页面禁止缓存
// app.use(async(ctx, next) => {
//   ctx.set("Cache-Control", "no-cache,no-store,must-revalidate")
//   ctx.set("Expires", "0")
//   ctx.set("Pragma", "no-cache")

//   await next()
// })

app.use(indexPageRouter.routes())

app.use(indexAPIRouter.routes())
app.use(usersAPIRouter.routes())
app.use(authAPIRouter.routes())
app.use(templatesAPIRouter.routes())
app.use(likesAPIRouter.routes())


app.on('error', (err) => {
  console.log(err.stack)
})

try {
  app.listen(CONFIG.webServer.port, CONFIG.webServer.host, () => {
    /* 服务器运行配置 */
    console.log(colors.green('服务器已启动'))
    console.log('监听端口   ：', `${colors.cyan(CONFIG.webServer.port)}`)
    console.log('运行环境   ：', `${colors.cyan(CONFIG.env)}`)

    let mysqlExtraConfigs = []
    for (let k in CONFIG.dbServer.mysql) {
      if (['host', 'port', 'username', 'password', 'database'].includes(k)) continue

      mysqlExtraConfigs.push(k + '=' + colors.cyan(CONFIG.dbServer.mysql[k]))
    }

    console.log('MySQL      ：', colors.yellow(`mysql://\
      ${colors.cyan(CONFIG.dbServer.mysql.username)}@\
      ${colors.cyan(CONFIG.dbServer.mysql.host)}:\
      ${CONFIG.dbServer.mysql.port}/\
      ${colors.cyan(CONFIG.dbServer.mysql.database)}?\
      ${mysqlExtraConfigs.join('&')}`.replace(/  /g, '')))

    console.log('Redis      ：', colors.yellow(`redis://\
      ${colors.cyan(CONFIG.dbServer.redis.host)}:\
      ${CONFIG.dbServer.redis.port}/\
      ${colors.cyan(CONFIG.dbServer.redis.db)}`.replace(/  /g, '')))

    /* 服务器安全配置 */
    if (CONFIG.dbServer.mysql.password) {
      console.log('MySQL密码  ：', colors.green('启用'))
    } else {
      console.log('MySQL密码  ：', colors.red('禁用'), colors.magenta('存在安全风险！'))
    }

    if (CONFIG.dbServer.redis.password) {
      console.log('Redis密码  ：', colors.green('启用'))
    } else {
      console.log('Redis密码  ：', colors.red('禁用'), colors.magenta('存在安全风险！'))
    }

    /* 用户认证配置 */
    if (CONFIG.webServer.xAuthHeader) {
      console.log('Header认证 ：', colors.yellow(`启用 ${colors.cyan(CONFIG.webServer.xAuthHeader)}`))
    } else {
      console.log('Header认证 ：', colors.white('禁用'))
    }

    if (CONFIG.webServer.xAuthQuery) {
      console.log('Query 认证 ：', colors.yellow(`启用 ${colors.cyan(CONFIG.webServer.xAuthQuery)}`))
    } else {
      console.log('Query 认证 ：', colors.white('禁用'))
    }

    if (CONFIG.webServer.xAuthCookie) {
      console.log('Cookie认证 ：', colors.yellow(`启用 ${colors.cyan(CONFIG.webServer.xAuthCookie)}`))
    } else {
      console.log('Cookie认证：', colors.white('禁用'))
    }

    if (!CONFIG.webServer.xAuthHeader &&
      !CONFIG.webServer.xAuthQuery &&
      !CONFIG.webServer.xAuthCookie) {
      console.log(colors.red('未启用任何认证方式，请检查配置中`webServer.xAuth*`部分'))
      process.exit(1)
    }

    console.log(colors.green('Have fun!'))
  })
} catch (ex) {
  console.log(ex)
  process.exit(1)
}

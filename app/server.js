'use strict'

/* 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import Koa from 'koa'
import server from 'koa-static'
import views from 'koa-views'
import userAgent from 'koa-useragent'
import nunjucks from 'nunjucks'
import logger from 'koa-logger'

/* 基础模块 */
import CONFIG from 'config'
import t from './baseModules/tools'

/** 项目模块 */
import prepare from './baseModules/prepare'

/** 路由加载 */
import indexPageRouter from './routers/indexPageRouter'
import indexAPIRouter from './routers/indexAPIRouter'

const app = new Koa()

// 靜態服務器
app.use(server(__dirname + '/static'))

// handlebars, nunjucks, ejs
app.use(views(path.join(__dirname, '/views'), {
  options: {
    nunjucksEnv: new nunjucks.Environment(
      new nunjucks.FileSystemLoader(path.join(__dirname, 'views'))
    ).addFilter('shorten', (str, count) => {
      return str.slice(0, count || 5)
    }),

    helpers: {
      uppercase: str => str.toUpperCase()
    },
    partials: CONFIG.hbs.partials
  },
  extension: 'hbs',
  map: {
    hbs: 'handlebars',
    njk: 'nunjucks',
    html: 'ejs',
  }
}))
app.use(logger())

// 中间初始化
app.use(userAgent)
app.use(prepare.response)

app.use(indexPageRouter.routes()).use(indexAPIRouter.routes())

app.on('error', (err) => {
  console.log(err.stack)
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    err.status = err.statusCode || err.status || 500


    // 错误详情
    try {
      ctx.state.logger('error', JSON.stringify(err.toJSON()));
    } catch (ex) {
      ctx.state.logger('error', err);
    }
    throw err
  }
})

app.listen(CONFIG.webServer.port, CONFIG.webServer.host, () => {
  console.log(`the server is start at port ${CONFIG.webServer.port}`)
})

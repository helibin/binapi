'use strict'

/* 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import Koa from 'koa'
import views from 'koa-views'
import userAgent from 'koa-useragent'

/* 基础模块 */
import CONFIG from 'config'
import t from './baseModules/tools'

/** 项目模块 */
import prepare from './baseModules/prepare'

/** 路由加载 */
import indexPageRouter from './routers/indexPageRouter'
import indexAPIRouter from './routers/indexAPIRouter'

const app = new Koa()


app.use(views(path.join(__dirname, '/views'), {
  extension: 'ejs'
}))

app.use(async (ctx, next) => {
  ctx.state = ctx.state || {}
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.state.xResposeTime = ms
  ctx.set('X-Response-Time', `${ms}ms`)
})

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

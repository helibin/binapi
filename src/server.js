'use strict'

/* 内建模块 */
import fs from 'fs'
import path from 'path'

/** 第三方模块 */
import Koa from 'koa'
import router from 'koa-router'
import views from 'koa-views'

/* 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import prepare from './baseModules/prepare'

const app = new Koa()

app.use(views(__dirname + '/views', {
  map: {
    html: 'underscore'
  }
}));

app.use(prepare.response)

app.use(async (ctx, next) => {
  ctx.logger('xxx', ctx.cookies.get('_clientId'))
  ctx.state = {
    title: 'app'
  };

  await ctx.render('user', {
    user: 'John'
  });
  ctx.logger('xxx', ctx.cookies.get('_clientId'))

});

app.use(async (ctx, next) => {
  ctx.state = ctx.state || {}
  ctx.state.now = new Date()
  ctx.state.ip = ctx.ip
  ctx.state.version = '2.0.0'
  return next()
})

app.on('error', (err) => {
  console.log(err.stack)
})

app.listen(CONFIG.webServer.port, CONFIG.webServer.host)
console.log(`the server is start at port ${CONFIG.webServer.port}`)

'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */

/** 项目模块 */

const apiRouter = new Router({
  prefix: '/api/v1'
})

apiRouter.get('/uses/do/list'
  , async(ctx) => {
    ctx.body = [
      {name: 'sdw', sex: 'f'}
      , {name: '2rsa', sex: 'm'}
    ]
  }
)

export default apiRouter

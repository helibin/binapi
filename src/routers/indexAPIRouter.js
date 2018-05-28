'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'
import _ from 'lodash'

/** 基础模块 */
import CONFIG from 'config'
import * as t from '../base_modules/tools'

/** 项目模块 */
import * as indexAPICtrl from '../controllers/indexAPICtrl'

const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/test', async (ctx) => {
  ctx.body = [{
    name: 'sdw',
    sex: 'f'
  }, {
    name: '2rsa',
    sex: 'm'
  }]
})

export default apiRouter

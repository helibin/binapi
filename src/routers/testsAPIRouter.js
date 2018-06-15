'use strict';

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import * as testsAPICtrl from '../controllers/testsAPICtrl'



const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/tests/do/test', testsAPICtrl.test)

export default apiRouter

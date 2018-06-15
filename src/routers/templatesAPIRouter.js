'use strict'

/** 内建模块 */

/** 第三方模块 */
import Router from 'koa-router'

/** 基础模块 */
import CONFIG from 'config'

/** 项目模块 */
import * as templatesAPICtrl from '../controllers/templatesAPICtrl'


const apiRouter = new Router({
  prefix: CONFIG.apiServer.prefix
})

apiRouter.get('/templates/do/list', templatesAPICtrl.listTemplates)

export default apiRouter
